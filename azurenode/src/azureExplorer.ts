import {
    AnonymousCredential,
    StorageURL,
    ServiceURL,
    Aborter,
    ContainerURL,
    BlobURL,
    Models
} from "@azure/storage-blob";
import * as Azure from "@azure/storage-blob";

export type BlobProperties = Models.BlobGetPropertiesResponse;

export const delimiter = "/";

export enum ItemType {
    Blob = "Blob",
    Directory = "Directory"
}

export interface IItem {
    type: ItemType;
    path: string;
    name: string;

    asBlob?: Blob;

    asDirectory?: Directory;
}

export interface ISet {
    getItemsList(prefix?: string): Promise<ItemList>;

    enumerateItems(prefix?: string): AsyncIterableIterator<IItem>;

    getFullLocation(): {sas:string,container:string,path:string};
}

export class ItemList implements Iterable<IItem> {
    [Symbol.iterator](): IterableIterator<IItem> {
        return this.enumerate();
    }

    directories: Array<Directory>;
    blobs: Array<Blob>;
    metadataLoaded: boolean;

    private blobTasks: Array<Promise<void>> = [];

    constructor() {
        this.directories = [];
        this.blobs = [];
        this.metadataLoaded = false;
    }

    add(item: IItem) {
        if (item.type === ItemType.Directory) {
            this.directories.push(item.asDirectory);
        }
        else if (item.type === ItemType.Blob) {
            this.blobs.push(item.asBlob);
            this.blobTasks.push(item.asBlob.getting);
        }
        else {
            throw new Error("Unknown item.type");
        }
    }

    waitBlobMetadata(): Promise<void> {
        return Promise.all(this.blobTasks).then(() => { this.metadataLoaded = true; });
    }

    private *enumerate(): IterableIterator<IItem> {

        for (const dir of this.directories) {
            yield dir;
        }
        for (const blob of this.blobs) {
            yield blob;
        }
    }
}

export class Storage {
    url: string;
    serviceURL: ServiceURL;
    private anonCred = new AnonymousCredential();
    private pipeline = StorageURL.newPipeline(this.anonCred);

    constructor(sasUrl: string) {
        this.url = sasUrl;
        try {
            this.serviceURL = new ServiceURL(this.url, this.pipeline);
        } catch (e) {
            throw new Error("Init storage failed. Please check your SAS.");
        }
    }

    public async* enumerateContainers(): AsyncIterableIterator<Container> {
        let marker: any = undefined;
        do {
            const listContainersResponse = await this.serviceURL.listContainersSegment(
                Aborter.none,
                marker
            );

            marker = listContainersResponse.marker;
            for (const container of listContainersResponse.containerItems) {
                yield new Container(this, container);
            }
        } while (marker);
    }

    public async findContainer(name: string): Promise<Container> {
        for await (const c of this.enumerateContainers()) {
            if (c.name === name) {
                return c;
            }
        }

        return null;
    }
}

export class Container implements ISet {
    name: string;

    storage:Storage;
    private containerURL: ContainerURL;
    private containerItem: Models.ContainerItem;

    constructor(storage: Storage, containerItem: Models.ContainerItem) {
        this.storage = storage;
        this.containerURL = ContainerURL.fromServiceURL(storage.serviceURL, containerItem.name);
        this.containerItem = containerItem;
        this.name = containerItem.name;
    }

    public async findPrefixDir(prefix: string): Promise<Directory> {
        if (!prefix) return null;

        while (prefix.endsWith(delimiter)) {
            prefix = prefix.substring(0, prefix.length - 1);
        }
        for await (const item of this.enumerateItems(prefix)) {
            if (item.type === ItemType.Directory && item.path === prefix + delimiter) {
                return item.asDirectory;
            }
        }
        return null;
    }

    public async getItemsList(prefix?: string): Promise<ItemList> {
        const ret: ItemList = new ItemList();
        for await (const item of this.enumerateItems(prefix)) {
            ret.add(item);
        }
        return ret;
    }

    public async* enumerateItems(prefix?: string): AsyncIterableIterator<IItem> {
        let marker: any;
        do {
            const listBlobsResponse = await this.containerURL.listBlobHierarchySegment(
                Aborter.none,
                delimiter,
                marker,
                prefix ? { prefix: prefix } : undefined
            );

            marker = listBlobsResponse.marker;

            if (listBlobsResponse.segment.blobPrefixes) {
                for (const prefix of listBlobsResponse.segment.blobPrefixes) {
                    yield new Directory(this, prefix.name);
                }
            }
            for (const blob of listBlobsResponse.segment.blobItems) {
                yield new Blob(this, blob);
            }
        } while (marker);
    }

    public getBlobURL(blob: Blob): BlobURL {
        return BlobURL.fromContainerURL(this.containerURL, blob.path);
    }

    public getFullLocation() {
        return {
            sas: this.storage.url,
            container: this.name,
            path: ""
        };
    }
}

export class Blob implements IItem {
    type = ItemType.Blob;
    asBlob = this;
    name: string;
    path: string;
    url: string;
    properties: BlobProperties;
    getting: Promise<void>;

    private container: Container;
    private blobURL: BlobURL;
    private blobItem: Models.BlobItem;

    constructor(container: Container, blobItem: Models.BlobItem) {
        this.container = container;
        this.blobItem = blobItem;
        this.path = blobItem.name;
        this.name = this.path.split(delimiter).pop();
        this.blobURL = this.container.getBlobURL(this);
        this.url = this.blobURL.url;
        this.properties = null;
        this.getting = this.getMetadata();
    }

    private getMetadata(): Promise<void> {
        const getProp = this.blobURL.getProperties(Aborter.timeout(5000))
            .then(
                (response) => {
                    this.properties = response;
                });
        return getProp;
    }
}

export class Directory implements IItem, ISet {
    type = ItemType.Directory;
    asDirectory = this;
    name: string;

    /* This contains a delimiter at the end. */
    path: string;

    private container: Container;

    constructor(container: Container, name: string, parent?: Directory) {
        this.container = container;
        
        const a = name.split(delimiter);
        this.name = a[a.length - 2];
        if (parent) {
            this.path = parent.path + name;
        }
        else {
            this.path = name;
        }
    }

    public getItemsList(prefix?: string): Promise<ItemList> {
        return this.container.getItemsList(this.path);
    }

    public enumerateItems(prefix?: string): AsyncIterableIterator<IItem> {
        return this.container.enumerateItems(this.path);
    }

    public getFullLocation() {
        return {
            sas: this.container.storage.url,
            container: this.container.name,
            path: this.path
        };
    }
}
import {
    SharedKeyCredential,
    TokenCredential,
    AnonymousCredential,
    StorageURL,
    ServiceURL,
    Aborter,
    ContainerURL,
    BlobURL,
    BlockBlobURL,
    Models
} from "@azure/storage-blob";
import * as Azure from "@azure/storage-blob";

export const delimiter = "/";

export enum ItemType {
    Blob = "Blob",
    Directory = "Directory"
}

export interface IItem {
    type: ItemType;
    path: string;

    asBlob?: Blob;

    asDirectory?: Directory;
}

export interface ISet {
    getItemsList(prefix?: string): Promise<ItemList>;

    enumerateItems(prefix?: string): AsyncIterableIterator<IItem>;
}

export class ItemList implements Iterable<IItem> {
    [Symbol.iterator](): IterableIterator<IItem> {
        return this.enumerate();
    }

    directories: Array<Directory>;

    blobs: Array<Blob>;

    private blobTasks: Array<Promise<void>> = [];

    constructor() {
        this.directories = [];
        this.blobs = [];
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
        return Promise.all(this.blobTasks).then(() => {});
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
    private url: string;
    private serviceURL: ServiceURL;
    private anonCred = new AnonymousCredential();
    private pipeline = StorageURL.newPipeline(this.anonCred);

    constructor(sasUrl: string) {
        this.url = sasUrl;
        this.serviceURL = new ServiceURL(this.url, this.pipeline);
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
                yield new Container(this.serviceURL, container);
            }
        } while (marker);
    }
}

export class Container implements ISet {
    name: string;

    private serviceURL: ServiceURL;
    private containerURL: ContainerURL;
    private containerItem: Models.ContainerItem;

    constructor(serviceURL: ServiceURL, containerItem: Models.ContainerItem) {
        this.serviceURL = serviceURL;
        this.containerURL = ContainerURL.fromServiceURL(serviceURL, containerItem.name);
        this.containerItem = containerItem;
        this.name = containerItem.name;
    }

    public async findPrefixDir(prefix: string): Promise<Directory> {
        if(!prefix) return null;

        while (prefix.endsWith(delimiter)) {
            prefix = prefix.substring(0, prefix.length - 2);
        }
        for await (const item of this.enumerateItems(prefix)) {
            console.log(item.path);
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
}

export class Blob implements IItem {
    type = ItemType.Blob;
    asBlob = this;

    path: string;
    url: string;
    properties: Models.BlobGetPropertiesResponse;

    getting: Promise<void>;

    private container: Container;
    private blobURL: BlobURL;
    private blobItem: Models.BlobItem;

    constructor(container: Container, blobItem: Models.BlobItem) {
        this.container = container;
        this.blobItem = blobItem;
        this.path = blobItem.name;
        this.blobURL = this.container.getBlobURL(this);
        this.url = this.blobURL.url;
        this.properties = null;
        this.getting = this.getMetadata();
    }

    private getMetadata(): Promise<void> {
        return this.blobURL.getProperties(Aborter.timeout(5000))
            .then(
                (response) => {
                    this.properties = response;
                });
    }
}

export class Directory implements IItem, ISet {
    type = ItemType.Directory;
    asDirectory = this;

    /* This contains a delimiter at the end. */
    path: string;

    private container: Container;

    constructor(container: Container, name: string, parent?: Directory) {
        this.container = container;
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
}
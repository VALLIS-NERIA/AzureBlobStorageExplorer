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

export class Storage {
    private url: string;
    private serviceURL: ServiceURL;
    private anonCred = new AnonymousCredential();
    private pipeline = StorageURL.newPipeline(this.anonCred);

    constructor(SASURL: string) {
        this.url = SASURL;
        this.serviceURL = new ServiceURL(this.url, this.pipeline);
    }

    public async* getContainers(): AsyncIterableIterator<Container> {
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

export class Container {
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

    public async getItemsList(dir?: Directory): Promise<ItemList> {
        const ret: ItemList = {directories: [], blobs: []};
        for await (const item of this.getItems(dir)){
            if (item.type == ItemType.Directory) {
                const dir = item as Directory;
                ret.directories.push(dir);
            } else {
                const blob = item as Blob;
                ret.blobs.push(blob);
            }
        }
        return ret;
    }

    public async* getItems(dir?: Directory): AsyncIterableIterator<Item> {
        let marker: any;
        do {
            const listBlobsResponse = await this.containerURL.listBlobHierarchySegment(
                Aborter.none,
                delimiter,
                marker,
                dir ? {prefix: dir.path + delimiter} : undefined
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

export enum ItemType {
    Blob = "Blob",
    Directory = "Directory"
}

export interface Item {
    type: ItemType;

    asBlob?: Blob;

    asDirectory?: Directory;
}

export interface ItemList {
    directories: Array<Directory>;
    blobs: Array<Blob>;
}

export class Blob implements Item {
    type = ItemType.Blob;
    asBlob = this;

    path: string;
    url: string;

    private container: Container;
    private blobURL: BlobURL;
    private blobItem: Models.BlobItem;

    constructor(container: Container, blobItem: Models.BlobItem) {
        this.container = container;
        this.blobItem = blobItem;
        this.path = blobItem.name;
        this.blobURL = this.container.getBlobURL(this);
        this.url = this.blobURL.url;
    }

}

export class Directory implements Item {
    type = ItemType.Directory;
    asDirectory = this;

    /* This does NOT contains a delimiter at the end. */
    path: string;

    private container: Container;

    constructor(container: Container, name: string, parent?: Directory) {
        this.container = container;
        if (parent) {
            this.path = parent.path + delimiter + name;
        } else {
            this.path = name;
        }
    }

    public async* getItems(): AsyncIterableIterator<Item> {
        return this.container.getItems(this);
    }
}

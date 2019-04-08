import { Blob } from "../../azureExplorer";

export default class ImageBlob {
    blob: Blob;
    thumb: string;
    get url(): string {
        return this.blob.url;
    }

    get name(): string {
        return this.blob.name;
    }

    static factory: (blob: Blob)=>string = (blob :Blob) => blob.url.replace(`/${blob.container.name}/`, "/thumb/") + ".thumb.jpg";

    constructor(b: Blob) {
        this.blob = b;
        this.thumb = ImageBlob.factory(this.blob);
    }
}
import { Blob } from "../../azureExplorer";
import { Environment } from "../../Environment";

export default class ImageBlob {
    blob: Blob;
    thumb: string;
    url: string;
    name: string;

    constructor(b: Blob) {
        this.blob = b;
        this.url = this.blob.url;
        this.name = this.blob.name;
        this.thumb = Environment.getImageThumbnail(this.blob);
    }
}
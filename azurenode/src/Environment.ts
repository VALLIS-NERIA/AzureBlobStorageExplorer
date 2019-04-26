import { Blob, AzurePath, ISet } from "./azureExplorer";
import { apiUrl, apiCode } from "./sas";
import * as PathLink from "./Components/Misc/PathLink";


export enum PathLinkRenderMode {
    RouterLink = "RouterLink",
    ClickCallback = "ClickCallback"
}

export class Environment {
    static getImageThumbnail: (image: Blob) => string;

    static getVideoThumbnail: (video: Blob) => string;

    static testVideoThumbnail: (video: Blob) => boolean;

    static pathLinkUrlGenerator: (path: AzurePath) => string;
    static pathLinkClickCallback: (set: ISet) => void;
    static pathLinkMode: PathLinkRenderMode = null;

}

export class EnvironmentManager {
    static getImageThumbnailFunctionBySize(size: string) {
        return (blob: Blob) => `${apiUrl}/thumb?code=${apiCode}&name=${blob.path}&size=${size}`;
    }

    static setImageThumbnailFunctionSize(size: string) {
        Environment.getImageThumbnail = EnvironmentManager.getImageThumbnailFunctionBySize(size);
    }

    static setNoImageThumbnailFunction() {
        Environment.getImageThumbnail = (blob) => blob.url;
    }

    static setRouterPathLink(urlGenerator: (path: AzurePath) => string) {
        Environment.pathLinkMode = PathLinkRenderMode.RouterLink;
        Environment.pathLinkUrlGenerator = urlGenerator;
    }

    static setStatePathLink(callback: (set: ISet) => void) {
        Environment.pathLinkMode = PathLinkRenderMode.ClickCallback;
        Environment.pathLinkClickCallback = callback;
    }
}

EnvironmentManager.setImageThumbnailFunctionSize("md");
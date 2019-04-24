import {
    Container,
    Directory,
    ItemList,
    ISet
} from "../../azureExplorer";

export const slash: string = "%2F";

export function getDirFullPathSearch(path: string, container?: string, dir?: string) {
    if (!container) return path;
    if (!dir) return `${path}?container=${container}`;

    const dirEncoded = encodeURI(dir);
    return `${path}?container=${container}&path=${dirEncoded}`;
}

export function getDirFullPathNotSearch(path: string, container?: string, dir?: string) {
    if (!container) return path;
    if (!dir) return `${path}/${container}`;
    return `${path}/${container}/${dir}`;
}

export function getDirFullPathGenerator(isSearch: boolean):
    (path: string, container?: string, dir?: string) => string {
    return isSearch ? getDirFullPathSearch : getDirFullPathNotSearch;
}

export function getPathFromSearch(searchStr: string): { containerName: string, dirPath: string } {
    const slash: string = "%2F";
    const slashReg: RegExp = /%2F/g;
    let containerName: string = null;
    let dirPath: string = null;
    // ?container=ero&path=Ariel/pro
    const search = decodeURI(searchStr);
    if (search.length < 2) {
        return {
            containerName: null,
            dirPath: null
        };
    }
    try {
        // remove ? then split
        let a = search.substring(1).split("&");
        // ?ero%2FAriel%2Fpro
        if (a.length === 1 && a[0].split("=").length === 1) {
            const r = new RegExp("/*([^/]+)/*(.*)");
            const match = a[0].match(r);
            [, containerName, dirPath] = match;
        }
        else {
            for (const prop of a) {
                let b = prop.split("=");
                const key = b[0];
                let value = b[1];
                if (key === "container") {
                    containerName = value;
                }
                else if (key === "path" || key === "dir") {
                    value = value.replace(/\//g, slash);
                    value = value.replace(slashReg, "/");
                    if (!value.endsWith("/")) {
                        value += "/";
                    }
                    dirPath = value;
                }
            }
        }
    } catch (e) {
        console.error(`Invalid URL query param: ${search}`);
        console.error(e);
        return {
            containerName: null,
            dirPath: null
        };
    }

    return {
        containerName: containerName,
        dirPath: dirPath
    };
}

export function getColWidthCss(column: string): string {
    let sm: number, md: number, lg: number;
    column = column.replace(/"|'/g, "");
    if (column === "") {
        return null;
    }
    const cols = column.split(" ");
    switch (cols.length) {
        case 1:
            sm = md = lg = Number.parseInt(cols[0]);
            break;
        case 2:
            sm = Number.parseInt(cols[0]);
            md = lg = Number.parseInt(cols[1]);
            break;
        case 3:
        default:
            sm = Number.parseInt(cols[0]);
            md = Number.parseInt(cols[1]);
            lg = Number.parseInt(cols[2]);
            break;
    }
    return `ms-Grid-col ms-sm${12 / sm} ms-md${12 / md} ms-lg${12 / lg}`;
}

export function isImageExt(filename: string): boolean {
    return filename.match(/(png|jpeg|jpg|gif)$/) ? true : false;
}
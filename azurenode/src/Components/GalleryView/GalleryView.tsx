import * as React from "react";
import { Loading } from "../Misc/Loading";
import { MasonryImageView } from "./MasonryImageView";
import { ButtonSlideImageView } from "./ButtonSlideImageView";
import ImageBlob from"./ImageBlob";
import {
    Storage,
    Container,
    Directory,
    ItemList,
    Blob,
    ISet
} from "../../azureExplorer";
import * as Utils from "../Misc/Utils";
import { apiUrl, apiCode } from "../../sas.ts";

export interface IGalleryViewProps {
    sasUrl: string;
    container: string;
    dir: string;
    column?: string;
    autoMasonry?: boolean;
    thumbSize?: string;
}

export interface IGalleryViewState {
    storage: Storage;
    container: Container;
    directories: Directory[];
    items: ItemList;
}

const styles = require("./GalleryView.module.less");

//ImageBlob.factory = (blob: Blob) => blob.path.replace(`/${blob.container.name}/`, "thumb") + ".thumb.jpg";

export default class GalleryView extends React.Component<IGalleryViewProps, IGalleryViewState> {
    constructor(props: IGalleryViewProps) {
        super(props);
        this.state = null;
        //console.log(ImageBlob.factory);
        this.init(props);
    }

    private async init(props: IGalleryViewProps): Promise<void> {
        let storage: Storage;
        let container: Container;
        let dirs: Directory[];
        try {
            storage = new Storage(props.sasUrl);
        } catch (e) {
            this.setState({ storage: null, container: null, directories: null, items: null });
            return;
        }
        container = await storage.findContainer(props.container);
        if (!container) {
            this.setState({ storage: null, container: null, directories: null, items: null });
            return;
        }

        if (props.thumbSize != null) {
            //ImageBlob.factory = (blob: Blob) => blob.url.replace(
            //    new RegExp(`(.+)/${container.name}/(.+?)\\?(.+)`),
            //    `$1/thumb-${props.thumbSize}/$2.thumb.jpg?$3`);
            if (props.thumbSize.startsWith("thumb-")) {
                props.thumbSize = props.thumbSize.replace("thumb-", "");
            }
            ImageBlob.factory =
                (blob: Blob) => `${apiUrl}/thumb?code=${apiCode}&name=${blob.path}&size=${props.thumbSize}`;
        }
        else {
            ImageBlob.factory = (blob: Blob) => blob.url;
        }

        const paths = props.dir.replace(/"|'/g, "").split(" ");
        dirs = [];


        const promises: Promise<ItemList>[] = [];
        for (const path of paths) {
            const dir = await container.findPrefixDir(decodeURI(path));
            if (dir) {
                dirs.push(dir);
                promises.push(dir.getItemsList());
            }
        }

        if (!dirs.length) {
            this.setState({ storage: null, container: null, directories: null, items: null });
            return;
        }

        this.setState(
            { storage: storage, container: container, directories: dirs },
            () => {
                Promise.all(promises).then(
                    lists => {
                        const items = new ItemList();
                        for (const list of lists) {
                            items.addMany(list);
                        }
                        this.setState({ items: items });
                    });
            });
    }

    public render() {
        if (!this.state) {
            return <Loading message="Initializing"/>;
        }
        if (!this.state.directories) {
            return <Loading message="Invalid SAS/Container name/Directory path."/>;
        }
        if (!this.state.items) {
            return <Loading message="Loading image list"/>;
        }
        const imgBlobs = this.state.items.blobs
            .filter((b) => Utils.isImageExt(b.name)).map(b => new ImageBlob(b));

        if (imgBlobs.length === 0) {
            return <Loading message="No image to show."/>;
        }

        let imgClass: string = null;
        if (this.props.column) {
            imgClass = Utils.getColWidthCss(this.props.column);
        }

        return (
            <React.Fragment>
                <ButtonSlideImageView className={styles.slideButton} imgs={imgBlobs}/>
                <MasonryImageView
                    className={styles.imageGridContainer}
                    imgs={imgBlobs}
                    itemClass={imgClass}
                    collapse={this.props.autoMasonry ? true : false}/>
            </React.Fragment>);
    }

}
import * as React from "react";
import { Loading } from "../Misc/Loading";
import { MasonryImageView } from "../SetExplorer/MasonryImageView";
import { ButtonSlideImageView } from "../SetExplorer/ButtonSlideImageView";
import {
    Storage,
    Container,
    Directory,
    ItemList,
    ISet
} from "../../azureExplorer";
import * as Utils from "../Misc/Utils";

export interface IGalleryViewProps {
    sasUrl: string;
    container: string;
    dir: string;
    column?: string;
    autoMasonry?: boolean;
}

export interface IGalleryViewState {
    storage: Storage;
    container: Container;
    directory: Directory;
    items: ItemList;
}

const styles = require("./GalleryView.module.less");

export default class GalleryView extends React.Component<IGalleryViewProps, IGalleryViewState> {
    constructor(props: IGalleryViewProps) {
        super(props);
        this.state = null;
        this.init(props);
    }

    private async init(props: IGalleryViewProps): Promise<void> {
        let storage: Storage;
        let container: Container;
        let dir: Directory;
        try {
            storage = new Storage(props.sasUrl);
        } catch (e) {
            storage = null;
        }
        container = storage ? await storage.findContainer(props.container) : null;
        dir = container ? await container.findPrefixDir(props.dir) : null;
        if (dir) {
            //this.setState(
            //    { storage: storage, container: container, directory: dir },
            //    () => {
            //        this.state.directory.getItemsList()
            //            .then(
            //                itemList =>
            //                itemList.waitBlobMetadata()
            //                .then(
            //                    () => this.setState({ items: itemList })
            //                )
            //            );
            //    });

            this.setState(
                { storage: storage, container: container, directory: dir },
                () => {
                    this.state.directory.getItemsList()
                        .then(itemList => this.setState({ items: itemList }));
                });
        }
        else {
            this.setState({ storage: null, container: null, directory: null, items: null });
        }
    }

    public render() {
        if (!this.state) {
            return <Loading message="Initializing"/>;
        }
        if (!this.state.directory) {
            return <Loading message="Invalid SAS/Container name/Directory path."/>;
        }
        if (!this.state.items) {
            return <Loading message="Loading image list"/>;
        }
        const imgBlobs = this.state.items.blobs
            .filter((b) => Utils.isImageExt(b.name));
        if (imgBlobs.length === 0) {
            return <Loading message="No image to show."/>;
        }

        let imgClass: string = null;
        if (this.props.column) {
            imgClass = Utils.getColWidthCss(this.props.column);
        }

        return (
            <React.Fragment>
                <ButtonSlideImageView className={styles.slideButton} blobs={imgBlobs}/>
                <MasonryImageView
                    className={styles.imageGridContainer}
                    blobs={imgBlobs}
                    itemClass={imgClass}
                    collapse={this.props.autoMasonry ? true : false}/>
            </React.Fragment>);
    }

}
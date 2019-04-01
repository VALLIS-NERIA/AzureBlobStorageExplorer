import * as React from "react";
import { Loading } from "../Misc/Loading";
import { ImageView } from "../SetExplorer/ImageView";
import {
    Storage,
    Container,
    Directory,
    ItemList,
    ISet
} from "../../azureExplorer";

export interface IGalleryViewProps {
    sasUrl: string;
    container: string;
    dir: string;
}

export interface IGalleryViewState {
    storage: Storage;
    container: Container;
    directory: Directory;
    items: ItemList;
}

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
            .filter((b) => b.name.match(/(png|jpeg|gif|)$/));
        if (imgBlobs.length === 0) {
            return <Loading message="No image to show."/>;
        }

        return <div style={{width:"100%",height:"100%"}}><ImageView blobs={imgBlobs} loadFinished={true}/></div>;
    }

}
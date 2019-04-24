import * as React from "react";
import { Loading } from "../Misc/Loading";
import ImageBlob from"../GalleryView/ImageBlob";
import { ListView, DisplaySchema } from "./ListView";
import { MasonryImageView } from "../GalleryView/MasonryImageView";
import {
    Container,
    Directory,
    ItemList,
    ISet
} from "../../azureExplorer";

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import {PathLink} from "../Misc/PathLink";
import * as Utils from "../Misc/Utils";

export interface ISetExplorerProps {
    container: Container; // null: storage view
    set: ISet; // ^
    itemList: ItemList; // null: storage view / item data fetching
}

interface ISetExplorerState {
    init: boolean;
    tabIndex: number;
}

const schema: DisplaySchema[] = [
    "contentType",
    { name: "contentLength", formatter: (a) => `${(a / 1024).toFixed(0)}KB` }
];
const styles: any = require("./SetExplorer.module.less");

export class SetExplorer extends React.Component<ISetExplorerProps, ISetExplorerState> {
    constructor(props: ISetExplorerProps) {
        super(props);
        this.state = { tabIndex: 0, init: true };
    }

    static getDerivedStateFromProps(newProp: ISetExplorerProps, prevState: ISetExplorerState): ISetExplorerState {
        if (!newProp.itemList) {
            return prevState;
        }

        const imgBlobs = newProp.itemList.blobs
            .filter((b) => Utils.isImageExt(b.name) || (b.properties && b.properties.contentType.includes("image")))
            .map(b => new ImageBlob(b));
        const mostImage: boolean = imgBlobs.length >
            (newProp.itemList.blobs.length + newProp.itemList.directories.length) * 0.7;
        const idx = mostImage ? 1 : 0;
        if (prevState.init && idx !== prevState.tabIndex) {
            prevState.tabIndex = idx;
            return prevState;
        }

        return prevState;
    }

    render(): JSX.Element {
        if (!this.props.itemList) {
            return <Loading/>;
        }

        const imgBlobs = this.props.itemList.blobs
            .filter((b) => Utils.isImageExt(b.name) || (b.properties && b.properties.contentType.includes("image")))
            .map(b => new ImageBlob(b));
        const hasImage: boolean = imgBlobs.length > 0;

        const elem = (
            <Tabs
                selectedIndex={this.state.tabIndex}
                onSelect={tabIndex => this.setState({ tabIndex: tabIndex, init: false })}
                className={styles.tabContainer}
                selectedTabPanelClassName={styles.tabContent}>
                <TabList>
                    <Tab>List</Tab>
                    <Tab disabled={!hasImage}>{`Image: ${imgBlobs.length}`}</Tab>
                </TabList>
                <div className={styles.tabContent}>
                    <TabPanel>
                        <ListView
                            className={`${styles.tabContent}`}
                            itemList={this.props.itemList}
                            schemas={schema}/>
                    </TabPanel>
                    <TabPanel>
                        <MasonryImageView
                            //loadFinished={this.props.itemList.metadataLoaded}
                            className={styles.tabContent}
                            imgs={imgBlobs}/>
                    </TabPanel>
                </div>
            </Tabs>);
        //const loc = this.props.set.getFullLocation();
        return <div>
            {elem}
            </div>;
    }
}

export default SetExplorer;
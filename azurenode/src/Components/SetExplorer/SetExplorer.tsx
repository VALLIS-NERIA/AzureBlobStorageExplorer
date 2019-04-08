﻿import * as React from "react";
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
import * as Utils from "../Misc/Utils";

export interface ISetExplorerProps {
    pathGen: (d: Directory) => string;
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

    render(): JSX.Element {
        if (!this.props.itemList) {
            return <Loading/>;
        }
        const imgBlobs = this.props.itemList.blobs
            .filter((b) => Utils.isImageExt(b.name) || (b.properties && b.properties.contentType.includes("image")))
            .map(b => new ImageBlob(b));
        //.filter((b) => b.properties && b.properties.contentType.includes("image"));
        const hasImage: boolean = imgBlobs.length > 0;
        const mostImage: boolean = imgBlobs.length >
            (this.props.itemList.blobs.length + this.props.itemList.directories.length) * 0.7;
        const idx = mostImage ? 1 : 0;
        if (this.state.init && idx !== this.state.tabIndex) {
            this.setState({ tabIndex: idx });
        }
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
                            dirUrl={this.props.pathGen}
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
        const loc = this.props.set.getFullLocation();
        return <div>
            {elem}
            </div>;
    }
}

export default SetExplorer;
import * as React from "react";
import * as AzureExplorer from "../../azureExplorer";
import { Loading } from "../Misc/Loading";
import { ListView, DisplaySchema } from "../ListView/ListView";
import { ImageView } from "../ImageView/ImageView";
import {
    Storage,
    Container,
    Blob,
    Directory,
    ItemList,
    IItem,
    ISet,
    ItemType,
    delimiter
} from "../../azureExplorer";

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import 'react-tabs/style/react-tabs.css';

export interface ISetExplorerProps {
    pathGen: (d: Directory) => string;
    container: AzureExplorer.Container; // null: storage view
    set: AzureExplorer.ISet; // ^
    itemList: AzureExplorer.ItemList; // null: storage view / item data fetching
}

const schema: DisplaySchema[] = [
    "contentType",
    { name: "contentLength", formatter: (a) => `${(a / 1024).toFixed(0)}KB` }
];
const styles: any = require("./SetExplorer.module.less");

export class SetExplorer extends React.Component<ISetExplorerProps, {}> {

    render(): JSX.Element {
        if (!this.props.itemList) {
            return <Loading/>;
        }
        const imgBlobs = this.props.itemList.blobs
            .filter((b) => b.properties && b.properties.contentType.includes("image"));
        const hasImage: boolean = imgBlobs.length > 0;
        const mostImage: boolean = imgBlobs.length >
            (this.props.itemList.blobs.length + this.props.itemList.directories.length) * 0.7;
        return (
            <Tabs defaultIndex={mostImage?1:0} className={styles.tabContainer} selectedTabPanelClassName={styles.tabContent}>
                <TabList>
                    <Tab>List</Tab>
                    <Tab disabled={!hasImage}>{`Image: ${imgBlobs.length}`}</Tab>
                </TabList>
                <div className={styles.tabContent}>
                    <TabPanel>
                        <ListView
                            className={`ag-theme-material ${styles.tabContent}`}
                            dirUrl={this.props.pathGen}
                            itemList={this.props.itemList}
                            schemas={schema}/>
                    </TabPanel>
                    <TabPanel>
                        <ImageView className={styles.tabContent}
                                   imgs={this.props.itemList.blobs
                            .filter((b) => b.properties && b.properties.contentType.includes("image"))
                            .map((b) => b.url)}/>
                    </TabPanel>
                </div>
            </Tabs>
        );
    }
}

export default SetExplorer;
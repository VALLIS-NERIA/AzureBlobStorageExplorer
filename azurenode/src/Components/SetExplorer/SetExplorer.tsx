import * as React from "react";
import { Loading } from "../Misc/Loading";
import ImageBlob from"../GalleryView/ImageBlob";
import { ListView, DisplaySchema } from "./ListView";
import { MasonryImageView } from "../GalleryView/MasonryImageView";
import {
    Container,
    Directory,
    Blob,
    ItemList,
    ISet
} from "../../azureExplorer";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { PathLink } from "../Misc/PathLink";
import * as Utils from "../Misc/Utils";
import { apiUrl, apiCode } from "../../sas";

export interface ISetExplorerProps {
    set: ISet;
}

interface ISetExplorerState {
    currentSet: ISet;
    itemList: ItemList;
    itemMetaReady: boolean;
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
        this.state = { currentSet: props.set, itemList: null, tabIndex: 0, init: true, itemMetaReady: false };
    }

    private isMostImage(itemList: ItemList): boolean {
        if (!itemList) {
            return false;
        }
        const imgCount = itemList.blobs.filter((b) => Utils.isImageExt(b.name)).length;
        const mostImage = imgCount > itemList.length * 0.5;
        return mostImage;
    }

    static getDerivedStateFromProps(newProp: ISetExplorerProps, prevState: ISetExplorerState): ISetExplorerState {
        if (newProp.set !== prevState.currentSet) {
            return { currentSet: newProp.set, itemList: null, tabIndex: 0, init: true, itemMetaReady: false };
        }
        else {
            return prevState;
        }
    }

    render(): JSX.Element {
        if (!this.state.itemList || !this.props.set) {
            return <Loading/>;
        }

        const imgBlobs = this.state.itemList.blobs
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
                            parent={this.state.currentSet.getParent()}
                            className={`${styles.tabContent}`}
                            itemList={this.state.itemList}
                            itemMetaReady={this.state.itemMetaReady}
                            schemas={schema}/>
                    </TabPanel>
                    <TabPanel>
                        <MasonryImageView
                            className={styles.tabContent}
                            imgs={imgBlobs}/>
                    </TabPanel>
                </div>
            </Tabs>);
        return <div>
                   {elem}
               </div>;
    }

    private fetchItems() {
        if (this.props.set&&!this.state.itemList) {
            this.props.set.getItemsList()
                .then((list) => {
                    list.waitBlobMetadata().then(() => this.setState({ itemMetaReady: true }));
                    this.setState({
                    itemList: list,
                    init: false,
                    tabIndex: this.isMostImage(list) ? 1 : 0
                })});
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.fetchItems();
    }

    componentDidMount() { this.fetchItems(); }
}

export default SetExplorer;
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
        let view: JSX.Element;
        if (!this.props.itemList) {
            view = <Loading />;
        }
        else {
            view = <ListView
                       className={`ag-theme-material ${styles.detail}`}
                       dirUrl={this.props.pathGen}
                       itemList={this.props.itemList}
                       schemas={schema} />;

            if (this.props.itemList.blobs.some((b) => b.properties && b.properties.contentType.includes("image"))) {
                const newView = (
                    <React.Fragment>
                        {view}
                        <ImageView imgs={this.props.itemList.blobs
                            .filter((b) => b.properties && b.properties.contentType.includes("image"))
                            .map((b) => b.path)} />
                    </React.Fragment>
                );
                view = newView;
            }
        }
        return view;
    }
}

export default SetExplorer;
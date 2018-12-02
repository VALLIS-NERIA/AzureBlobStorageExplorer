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

import * as React from "react";
import { BrowserRouter, Router, Route, Link, RouteProps, RouteComponentProps } from "react-router-dom";

interface MatchParams {
    containerName: string;
    dirPath?: string;
}

interface IExplorerProp extends RouteComponentProps<MatchParams> {
    storage: Storage;
    containers: Container[];
}

interface IExplorerState {
    container: Container;
    set: ISet;
    containerName: string;
    itemList: ItemList;
}

export class ContainerExplorer extends React.Component<IExplorerProp, IExplorerState> {

    constructor(props: IExplorerProp) {
        super(props);

        this.updateState(this.props);
    }

    private updateState(props: IExplorerProp) {
        let container: Container = null;
        if (props.containers) {
            for (const c of props.containers) {
                if (c.name === props.match.params.containerName) {
                    container = c;
                }
            }
        }

        let set: ISet = container;
        if (props.match.params.dirPath && container) {
            set = null;
            container.findPrefixDir(props.match.params.dirPath)
                .then(
                    (dir) => {
                        if (dir) {
                            this.setState({ set: dir });
                            this.getItems();
                        }
                    });
        }

        this.state = {
            container: container,
            set: set,
            containerName: props.match.params.containerName,
            itemList: null
        }

        this.getItems();
    }

    componentWillReceiveProps(nextProps: IExplorerProp) {
        this.updateState(nextProps);
    }

    private async getItems() {
        if (this.state.set) {
            const res = await this.state.set.getItemsList();
            await res.waitBlobMetadata();
            this.setState({ itemList: res });
        }
    }

    render() {
        const list: JSX.Element[] = [];
        if (this.state.itemList) {
            const items = this.state.itemList;
            for (const dir of items.directories) {
                list.push(<Link to={"/" + this.state.containerName + "/" + dir.path}> {`Dir: ${dir.path}`} </Link>);
            }
            for (const blob of items.blobs) {
                const mime: string = blob.properties ? blob.properties.contentType : "";
                list.push(
                    <div>
                        <a href={blob.url} target="_blank" type={mime}> {`Blob: ${blob.path}`} </a>
                    </div>);
            }
        }
        list.push(<div><Link to="/">Back to top </Link></div>);
        return <div> {list} </div>;
        //return <div> {this.state.container?"YES":"NO"}{this.props.match.params.containerName}</div>;
    }
}
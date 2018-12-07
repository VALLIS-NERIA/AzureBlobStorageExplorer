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
import { Link, RouteComponentProps } from "react-router-dom";
import { Loading } from "../Misc/Loading";
import { DetailView } from "../Misc/DetailView";
import "ag-grid-community/dist/styles/ag-theme-material.css";


interface IExplorerProp extends RouteComponentProps {
    isSearch: boolean;
    path: { containerName: string, dirPath?: string };
    storage?: Storage;
    containers?: Container[];
}

interface IExplorerState {
    myProp: IExplorerProp;
    container: Container; // null: storage view
    set: ISet; // ^
    itemList: ItemList; // null: storage view / item data fetching
}

const styles: any = require("./ContainerExplorer.module.less");
const slash: string = "%2F";
const schema: string[] = ["contentType", "contentLength"];

export class ContainerExplorer extends React.Component<IExplorerProp, IExplorerState> {
    constructor(props: IExplorerProp) {
        super(props);
        this.state = {
            myProp: props,
            container: ContainerExplorer.findContainer(props),
            set: null,
            itemList: null
        };
    }

    componentDidMount(): void {
        this.getSetAndItems(this.props);
    }

    render() {
        if (!this.state.container) {
            return this.selectContainerView();
        }

        return this.setView();
    }

    /* Rendering */

    private getDirFullPath(dir: Directory): string {
        if (this.props.isSearch) {
            const dirPath = dir.path.replace(/\//g, slash);
            return `${this.props.location.pathname}?container=${this.state.container.name}&path=${dirPath}`;
        }
        else {
            return `/${this.state.container.name}/${dir.path}`;
        }
    }

    private selectContainerView(): JSX.Element {
        const list: JSX.Element[] = [];
        for (const cont of this.props.containers) {
            const path: string = this.props.isSearch
                ? `${this.props.location.pathname}?container=${cont.name}`
                : `/${cont.name}`;
            list.push(<Link to={path}> {`Container: ${cont.name}`} </Link>);
        }
        return <div className={styles.detail}>
                   {list}
               </div>;
    }

    private setView(): JSX.Element {
        let view: JSX.Element;
        if (!this.state.itemList) {
            view=<Loading />;
        }
        else {
            view = <DetailView className={`ag-theme-material ${styles.detail}`} dirUrl={this.getDirFullPath.bind(this)} itemList={this.state.itemList} schema={schema} />;
        }

        return (
            <div className={styles.container}>
                <div className={styles.backToTop}>
                    <Link to={this.props.isSearch ? this.props.location.pathname : "/"}>
                        Back to top
                    </Link>
                </div>
                {view}
            </div>);
    }

    /* Life cycle */

    /* Temporarily commented*/
    static getDerivedStateFromProps(newProp: IExplorerProp, prevState: IExplorerState): IExplorerState {
        if (newProp === prevState.myProp) {
            return null;
        }

        let container: Container = null;
        if (prevState.container && prevState.container.name === newProp.path.containerName) {
            container = prevState.container;
        }
        else {
            container = ContainerExplorer.findContainer(newProp);
        }

        return {
            myProp: newProp,
            container: container,
            set: null,
            itemList: null
        };
    }

    componentDidUpdate(prevProps: IExplorerProp, prevState: IExplorerState, snapshot?): void {
        if (this.state.container && !this.state.set) {
            this.getSetAndItems(this.props);
        }
    }

    private static findContainer(props: IExplorerProp): Container {
        for (const c of props.containers) {
            if (c.name === props.path.containerName) {
                return c;
            }
        }
        return null;
    }

    private async getSetAndItems(props: IExplorerProp): Promise<void> {
        const container = this.state.container;
        const dirPath = this.props.path.dirPath;

        let set: ISet = container;
        if (container && dirPath) {
            const dir = await container.findPrefixDir(dirPath);
            if (dir) {
                set = dir;
            }
        }
        this.setState({ set: set, }, () => { this.fetchItems(); });
    }

    private static async getContainers(storage: Storage): Promise<Container[]> {
        const list: Container[] = [];
        for await (const container of storage.enumerateContainers()) {
            list.push(container);
        }
        return list;
    }

    private async fetchItems(): Promise<void> {
        if (this.state.set) {
            const res = await this.state.set.getItemsList();
            this.setState({ itemList: res });
            res.waitBlobMetadata().then(() => this.setState({ itemList: res }));
        }
    }
}
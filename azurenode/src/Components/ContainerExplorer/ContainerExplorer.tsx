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
import { Link, RouteComponentProps, match } from "react-router-dom";
import { Loading } from "../Misc/Loading";

// TODO: modify MainRouter : (props)=><ContainerExplorer containerName={props.match.params.containerName} ...

interface IExplorerProp extends RouteComponentProps {
    isSearch: boolean;
    sasUrl: string;
    storage?: Storage;
    containers?: Container[];
    containerName?: string;
    dirPath?: string;
    search?: string;
}

interface IExplorerState {
    storage: Storage; // Never null
    containers: Container[]; // null: initializing
    container: Container; // null: storage view
    containerName: string; // ^
    set: ISet; // ^
    itemList: ItemList; // null: storage view / item data fetching
}

const styles: any = require("./ContainerExplorer.module.less");
const slash: string = "%2F";
const slashReg: RegExp = /%2F/g;


export class ContainerExplorer extends React.Component<IExplorerProp, IExplorerState> {
    constructor(props: IExplorerProp) {
        super(props);
        this.state = {
            storage: props.storage ? props.storage : new Storage(props.sasUrl),
            containers: props.containers ? props.containers : null,
            container: null,
            containerName: null,
            set: null,
            itemList: null
        };
    }

    componentDidMount(): void {
        this.updateState(this.props);
    }

    componentWillReceiveProps(nextProps: IExplorerProp) {
        this.updateState(nextProps);
    }

    render() {
        if (!this.state.containers) {
            return <Loading />;
        }

        if (this.state.containers && !this.state.container) {
            // show container list
            return this.storageView();
        }

        return this.setView();
        //return <div> {this.state.container?"YES":"NO"}{this.props.match.params.containerName}</div>;
    }

    /* Rendering */

    private getDirFullPath(dir: Directory): string {
        if (this.props.isSearch) {
            const dirPath = dir.path.replace(/\//g, slash);
            return `${this.props.location.pathname}?container=${this.state.containerName}&path=${dirPath}`;
        }
        else {
            return `/${this.state.containerName}/${dir.path}`;
        }
    }

    private storageView(): JSX.Element {
        const list: JSX.Element[] = [];
        for (const cont of this.state.containers) {
            const path: string = this.props.isSearch
                ? `${this.props.location.pathname}?container=${cont.name}`
                : `/${cont.name}`;
            list.push(<Link to={path}> {`Container: ${cont.name}`} </Link>);
        }
        return <div>
                   {list}
               </div>;
    }

    private setView(): JSX.Element {
        const list: JSX.Element[] = [];
        if (!this.state.itemList) {
            list.push(<Loading />);
        }
        else {
            const items = this.state.itemList;
            for (const dir of items.directories) {
                list.push(<div><Link to={this.getDirFullPath(dir)}> {`Dir: ${dir.path}`} </Link></div>);
            }
            for (const blob of items.blobs) {
                const mime: string = blob.properties ? blob.properties.contentType : "";
                list.push(
                    <div>
                        <a href={blob.url} target="_blank" type={mime}> {`Blob: ${blob.path}`} </a>
                    </div>);
            }
        }

        return (
            <div>
                <div className={styles.backToTop}>
                    <Link to={this.props.isSearch ? this.props.location.pathname : "/"}>
                        Back to top
                    </Link>
                </div>
                <div>
                    {list}
                </div>
            </div>);
    }

    /* Life cycle */

    /* Temporarily commented
    static getDerivedStateFromProps(newProp: IExplorerProp, prevState: IExplorerState): IExplorerState {
        const temp: IExplorerState = {
            storage: null,
            containers: null,
            container: null,
            containerName: null,
            set: null,
            itemList: null
        };

        // NOT null
        temp.storage = prevState.storage ? prevState.storage : new Storage(newProp.sasUrl);

        // MAYBE null
        temp.containers = prevState.containers;
        temp.container = prevState.containerName === newProp.containerName ? prevState.container : null;
        temp.containerName = prevState.containerName === newProp.containerName ? prevState.containerName : null;

        // MUST null
        temp.set = null;
        temp.itemList = null;

        return temp;
    }

    componentDidUpdate(prevProps: IExplorerProp, prevState: IExplorerState, snapshot?): void {
        this.updateState(prevProps);
    }
    */

    private async updateState(props: IExplorerProp): Promise<void> {
        const temp: IExplorerState = {
            storage: null,
            containers: null,
            container: null,
            containerName: null,
            set: null,
            itemList: null
        };

        temp.storage = this.state.storage ? this.state.storage : new Storage(props.sasUrl);
        temp.containers = this.state.containers
            ? this.state.containers
            : await ContainerExplorer.getContainers(temp.storage);
        const path = await ContainerExplorer.getPath(props, temp.containers);
        temp.container = path.container;
        temp.containerName = path.containerName;
        temp.set = path.set;

        this.setState(temp, this.fetchItems);
    }

    private static async getContainers(storage: Storage): Promise<Container[]> {
        const list: Container[] = [];
        for await (const container of storage.enumerateContainers()) {
            list.push(container);
        }
        return list;
    }

    private static async getPath(props: IExplorerProp, containers: Container[]): Promise<{
        container: Container,
        containerName: string,
        set: ISet;
    }> {
        let containerName: string = null;
        let dirPath: string = null;
        if (props.isSearch && props.search) {
            // ?container=ero&path=Ariel/pro
            const search = decodeURI(props.search);
            try {
                // remove ? then split
                let a = search.substring(1).split("&");
                for (const prop of a) {
                    let b = prop.split("=");
                    const key = b[0];
                    let value = b[1];
                    if (key === "container") {
                        containerName = value;
                    }
                    else if (key === "path" || key == "dir") {
                        value = value.replace(/\//g, slash);
                        value = value.replace(slashReg, "/");
                        if (!value.endsWith("/")) {
                            value += "/";
                        }
                        dirPath = value;
                    }
                }
            } catch (e) {
                console.error(`Invalid URL query param: ${search}`);
                console.error(e);
            }
        }
        else {
            containerName = props.containerName;
            dirPath = props.dirPath;
        }

        // Now we have containerName and dirPath
        let container: Container = null;
        if (!containerName) {
            // You are at the home page, should list the containers.
            return { container: null, containerName: null, set: null };
        }

        for (const c of containers) {
            if (c.name === containerName) {
                container = c;
            }
        }

        let set: ISet = container;
        if (container) {
            // if dirPath is undefined, the method returns null
            const dir = dirPath ? await container.findPrefixDir(dirPath) : null;
            if (dir) {
                set = dir;
            }
        }

        return { container: container, containerName: containerName, set: set };
    }

    private async fetchItems(): Promise<void> {
        if (this.state.set) {
            const res = await this.state.set.getItemsList();
            this.setState({ itemList: res });
            // TODO: experiment
            res.waitBlobMetadata().then(() => this.setState({ itemList: res }));
        }
    }
}
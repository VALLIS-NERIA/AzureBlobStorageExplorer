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

// TODO: modify MainRouter : (props)=><ContainerExplorer containerName={props.match.params.containerName} ...

interface IExplorerProp {
    sasUrl: string;
    isSearch: boolean;
    containerName?: string;
    dirPath?: string;
    search?: string;
}

interface IExplorerState {
    storage: Storage;
    containers: Container[];
    container: Container;
    containerName: string;
    set: ISet;
    itemList: ItemList;
}

const styles: any = require("./ContainerExplorer.less");

export class ContainerExplorer extends React.Component<IExplorerProp, IExplorerState> {
    constructor(props: IExplorerProp) {
        super(props);
        this.state = {
            storage: null,
            containers: null,
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
        if (!this.state.storage) {
            return this.loadingView();
        }

        if (this.state.container && !this.state.container) {
            // show container list
            return this.storageView();
        }

        if (!this.state.itemList) {
            return this.loadingView();
        }

        if (this.state.itemList) {
            return this.setView();
        }
        //return <div> {this.state.container?"YES":"NO"}{this.props.match.params.containerName}</div>;
    }

    /* Rendering */

    private getDirFullPath(dir: Directory): string {
        if (this.props.isSearch) {
            return `/?container=${this.state.containerName}&path=${dir.path}`;
        }
        else {
            return `/${this.state.containerName}/${dir.path}`;
        }
    }

    private storageView(): JSX.Element {
        const list: JSX.Element[] = [];
        for (const cont of this.state.containers) {
            list.push(<Link to={`/${cont.name}`}> {`Container: ${cont.name}`} </Link>);
        }
        return <div>
                   <div>
                       {list}
                   </div>
               </div>;
    }

    private setView(): JSX.Element {
        const list: JSX.Element[] = [];
        const items = this.state.itemList;
        for (const dir of items.directories) {
            list.push(<Link to={this.getDirFullPath(dir)}> {`Dir: ${dir.path}`} </Link>);
        }
        for (const blob of items.blobs) {
            const mime: string = blob.properties ? blob.properties.contentType : "";
            list.push(
                <div>
                    <a href={blob.url} target="_blank" type={mime}> {`Blob: ${blob.path}`} </a>
                </div>);
        }
        return <div>
                   <Link className={styles.backToTop} to="/">Back to top </Link>
                   <div>
                       {list}
                   </div>
               </div>;
    }

    private loadingView(): JSX.Element {
        return <div>Loading...</div>;
    }

    /* Life cycle */

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
        temp.containers = this.state.containers ? this.state.containers : await ContainerExplorer.getContainers(temp.storage);
        const path = await ContainerExplorer.getPath(props, temp.containers);
        temp.container = path.container;
        temp.containerName = path.containerName;
        temp.set = path.set;

        this.setState(temp, this.getItems);
    }

    private static async getContainers(storage: Storage): Promise<Container[]> {
        const list: Container[] = [];
        for await (const container of storage.enumerateContainers()) {
            list.push(container);
        }
        return list;
    }

    private static async getPath(props: IExplorerProp, containers: Container[]): Promise<{ container: Container, containerName: string, set: ISet }> {
        let containerName: string = null;
        let dirPath: string = null;
        if (props.isSearch) {
            // ?container=ero&path=Ariel/pro
            const search = props.search;
            try {
                // remove ? then split
                let a = search.substring(1).split("&");
                for (const prop of a) {
                    let b = prop.split("=");
                    const key = b[0];
                    const value = b[1];
                    if (key === "container") {
                        containerName = value;
                    }

                    else if (key === "path" || key == "dir") {
                        dirPath = value;
                    }
                }
            }
            catch (e) {
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

    private async getItems(): Promise<void> {
        if (this.state.set) {
            const res = await this.state.set.getItemsList();
            this.setState({ itemList: res });
            // TODO: experiment
            res.waitBlobMetadata().then(() => this.setState({ itemList: res }));
        }
    }
}
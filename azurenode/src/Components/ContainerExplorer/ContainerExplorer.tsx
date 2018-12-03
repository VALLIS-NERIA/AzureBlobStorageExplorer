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

interface IMatchParam {
    containerName?: string;
    dirPath?: string;
}

interface IExplorerProp extends RouteComponentProps<IMatchParam> {
    sasUrl: string;
    isSearch: boolean;
}

interface IExplorerState {
    storage: Storage;
    containers: Container[];
    container: Container;
    set: ISet;
    containerName: string;
    itemList: ItemList;
}

const styles = require("./ContainerExplorer.less");

export class ContainerExplorer extends React.Component<IExplorerProp, IExplorerState> {

    constructor(props: IExplorerProp) {
        super(props);
        this.state = {
            storage: null,
            containers: null,
            container: null,
            set: null,
            containerName: null,
            itemList: null
        };
    }

    componentDidMount(): void {
        this.updateState(this.props);
    }

    componentWillReceiveProps(nextProps: IExplorerProp) {
        this.updateState(nextProps);
    }

    private updateState(props: IExplorerProp) {
        this.state = {
            storage: this.state.storage, //storage and containers are not reset
            containers: this.state.containers,
            container: null,
            set: null,
            containerName: null,
            itemList: null
        };

        if (!this.state.storage) {
            this.setState({ storage: new Storage(props.sasUrl) }, () => this.getContainers(props));
        }
        else {
            if (!this.state.containers) {
                this.getContainers(props);
            }
            else {
                // we have containers
                this.getPath(props);
            }
        }
    }

    // next: getPath
    private async getContainers(props: IExplorerProp): Promise<void> {
        const list: Container[] = [];
        for await (const container of this.state.storage.enumerateContainers()) {
            list.push(container);
        }
        this.setState({ containers: list }, () => this.getPath(props));
    }

    // next: getItems
    private async getPath(props: IExplorerProp): Promise<void> {
        if (!this.state.containers) {
            return;
        }
        if (props.isSearch) {
            const search = props.location.search;
            // TODO: split
        }
        else {
            let container: Container = null;
            const containerName = props.match.params.containerName;
            if (!containerName) {
                // You are at the home page, should list the containers.
                this.setState({ container: null, containerName: null, set: null });
                return;
            }

            for (const c of this.state.containers) {
                if (c.name === containerName) {
                    container = c;
                }
            }

            this.state = {
                storage: this.state.storage,
                containers: this.state.containers,
                container: container,
                containerName: containerName,
                set: null,
                itemList: null
            };

            if (container) {
                // if dirPath is undefined, the method returns null
                container.findPrefixDir(props.match.params.dirPath)
                    .then((dir) => {
                        const set = dir ? dir : container;
                        this.setState({ set: set }, this.getItems);
                    });
            }
        }
    }

    // final
    private async getItems(): Promise<void> {
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

        return <div>
            <Link className={styles.backToTop} to="/">Back to top </Link>
            <div>
                {list}
            </div>
        </div>;
        //return <div> {this.state.container?"YES":"NO"}{this.props.match.params.containerName}</div>;
    }
}
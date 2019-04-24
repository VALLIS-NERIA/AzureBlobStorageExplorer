import {
    Storage,
    Container,
    Blob,
    Directory,
    ItemList,
    IItem,
    ISet,
    ItemType,
    delimiter,
    AzurePath
} from "../../azureExplorer";

import * as React from "react";
import { Loading } from "../Misc/Loading";
import { Header } from "../Misc/Header";
import SetExplorer from "../SetExplorer/SetExplorer";
import {PathLink, PathLinkRenderMode } from "../Misc/PathLink";


interface IExplorerProp {
    path: AzurePath;
    storage: Storage;
    containers: Container[];
    pathGenerator: (path: AzurePath) => string;
    clickCallback?: (path: AzurePath) => void;
    renderMode: PathLinkRenderMode;
}

export interface IExplorerState {
    myProp: IExplorerProp;
    container: Container; // null: storage view
    set: ISet; // ^
    itemList: ItemList; // null: storage view / item data fetching
}


const styles: any = require("./ContainerExplorer.module.less");
const slash: string = "%2F";

export class ContainerExplorer extends React.Component<IExplorerProp, IExplorerState> {
    constructor(props: IExplorerProp) {
        super(props);
        this.state = {
            myProp: props,
            container: ContainerExplorer.findContainer(props),
            set: null,
            itemList: null
        };
        PathLink.pathLinkGenerator = this.props.pathGenerator;
        PathLink.clickCallback = this.props.clickCallback;
        PathLink.renderMode = this.props.renderMode;
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

    private selectContainerView(): JSX.Element {
        const list: JSX.Element[] = [];

            for (const cont of this.props.containers) {
                list.push(
                    <PathLink
                        style={{ display: "block" }}
                        path={{containerName: cont.name}}>
                        {`Container: ${cont.name}`}
                    </PathLink>);
            }
        return <div className={styles.detail}>
                   {list}
               </div>;
    }

    private setView(): JSX.Element {
        return (
            <div className={styles.container}>
                <div className={styles.backToTop}>
                    { /*<Link to={this.props.isSearch ? this.props.location.pathname : "/"}>
                         Back to top
                     </Link>*/
                    }
                    <Header
                        path={this.props.path}/>
                </div>
                <SetExplorer
                    container={this.state.container}
                    set={this.state.set}
                    itemList={this.state.itemList}/>
            </div>);

    }

    /* Life cycle */

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

    private async fetchItems(): Promise<void> {
        if (this.state.set) {
            const res = await this.state.set.getItemsList();
            this.setState({ itemList: res });
            res.waitBlobMetadata().then(() => this.setState({ itemList: res }));
        }
    }
}
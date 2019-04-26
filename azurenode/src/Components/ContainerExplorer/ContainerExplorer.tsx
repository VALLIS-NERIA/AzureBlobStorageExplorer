﻿import {
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
import { PathLink } from "../Misc/PathLink";


interface IExplorerProp {
    path: AzurePath;
    storage: Storage;
    containers: Container[];
}

export interface IExplorerState {
    myProp: IExplorerProp;
    container: Container; // null: storage view
    set: ISet; // ^
}


const styles: any = require("./ContainerExplorer.module.less");
const slash: string = "%2F";

export class ContainerExplorer extends React.Component<IExplorerProp, IExplorerState> {
    constructor(props: IExplorerProp) {
        super(props);
        this.state = {
            myProp: props,
            container: ContainerExplorer.findContainer(props),
            set: null
        };
    }

    componentDidMount(): void {
        this.getSet(this.props);
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
                    set={cont}>
                    {`Container: ${cont.name}`}
                </PathLink>);
        }
        return <div className={styles.detail}>
                   {list}
               </div>;
    }

    private setView(): JSX.Element {
        if (!this.state.set) {
            return <Loading/>;
        }
        return (
            <div className={styles.container}>
                <div className={styles.backToTop}>
                    { /*<Link to={this.props.isSearch ? this.props.location.pathname : "/"}>
                         Back to top
                     </Link>*/
                    }
                    <Header set={this.state.set}/>
                </div>
                <SetExplorer set={this.state.set}/>
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
            set: null
        };
    }

    componentDidUpdate(prevProps: IExplorerProp, prevState: IExplorerState, snapshot?): void {
        if (this.state.container && !this.state.set) {
            this.getSet(this.props);
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

    private async getSet(props: IExplorerProp): Promise<void> {
        const container = this.state.container;
        const dirPath = this.props.path.dirPath;

        let set: ISet = container;
        if (container && dirPath) {
            const dir = await container.findPrefixDir(dirPath);
            if (dir) {
                set = dir;
            }
        }
        this.setState({ set: set, }, () => { this.props.path.dirPath = null });
    }
}
import {
    Storage,
    Container,
    Blob,
    Directory,
    ItemList,
    IItem,
    ItemType,
    AzurePath
} from "../../azureExplorer";

import * as React from "react";
import { BrowserRouter, Router, Route, Link, RouteComponentProps, Switch } from "react-router-dom";
import { createBrowserHistory, createHashHistory, createMemoryHistory } from "history";
import { ContainerExplorer } from "../ContainerExplorer/ContainerExplorer";
import { Loading } from "../Misc/Loading";
import * as Utils from "../Misc/Utils";
import * as PathLink from "../Misc/PathLink";
import {SetExplorer} from "../SetExplorer/SetExplorer";

export interface IStateRouterProps {
    sasUrl: string;
    containerName?: string;
}

export interface IStateRouterState {
    path: AzurePath;
    storage: Storage;
    containers: Container[];
    currentContainer: Container;
}

export class StateRouter extends React.Component<IStateRouterProps, IStateRouterState> {
    constructor(props: IStateRouterProps) {
        super(props);
        try {
            this.state = {
                path: null,
                storage: new Storage(props.sasUrl),
                containers: null,
                currentContainer: null
            };
        } catch (e) {
            this.state = {
                path: null,
                storage: null,
                containers: null,
                currentContainer: null
            };
        }

        this.findContainer(props.containerName);
    }

    private async findContainer(name?: string): Promise<void> {
        const list: Container[] = [];
        for await (const c of this.state.storage.enumerateContainers()) {
            list.push(c);
        }

        let container: Container = null;
        if (name) {
            for (const c of list) {
                if (c.name === name) {
                    container = c;
                    break;
                }
            }
        }
        this.setState({ containers: list, currentContainer: container, path: { containerName: name } });
    }

    render() {
        if (!this.state.storage) {
            return <Loading message="An error occured. Please check your SAS URL."/>;
        }

        if (!this.state.containers) {
            return <Loading message="Initializing"/>;
        }

        if (!this.state.currentContainer) {
            return <ContainerExplorer
                       storage={this.state.storage}
                       containers={this.state.containers}
                       path={this.state.path}
                       pathGenerator={null}
                       clickCallback={(path) => { this.setState({ path: path }); }}
                       renderMode={PathLink.PathLinkRenderMode.ClickCallback}/>;
        }

        //TODO: return SetExplorer directly if container is set.
    }
}
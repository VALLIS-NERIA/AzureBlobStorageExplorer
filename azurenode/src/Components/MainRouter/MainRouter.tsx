import {
    Storage,
    Container,
    Blob,
    Directory,
    ItemList,
    IItem,
    ItemType
} from "../../azureExplorer";

import * as React from "react";
import { BrowserRouter, Router, Route, Link, RouteComponentProps, Switch } from "react-router-dom";
import { createBrowserHistory, createHashHistory, createMemoryHistory } from "history";
import { ContainerExplorer } from "../ContainerExplorer/ContainerExplorer";
import { Loading } from "../Misc/Loading";

interface IRouterProp {
    url?: string;
}

interface IRouterState {
    url?: string;
    storage: Storage;
    containers: Container[];
}

const history = createBrowserHistory();

export class MainRouter extends React.Component<IRouterProp, IRouterState> {
    constructor(props: IRouterProp) {
        super(props);

        let url: string;
        if (props.url) {
            url = props.url;
        }
        else {
            url = null;
            const node = document.getElementById("sasUrl");
            if (node && node.innerText.trim().startsWith("http")) {
                url = node.innerText.trim();
            }
        }

        this.state = {
            url: url,
            storage: new Storage(url),
            containers: null
        };
        this.fetchContainers();
    }

    private async fetchContainers(): Promise<void> {
        const list: Container[] = [];
        for await (const c of this.state.storage.enumerateContainers()) {
            list.push(c);
        }

        this.setState({ containers: list });
    }

    private static getPathFromSearch(props: RouteComponentProps): { containerName: string, dirPath: string } {
        const slash: string = "%2F";
        const slashReg: RegExp = /%2F/g;
        let containerName: string = null;
        let dirPath: string = null;
        // ?container=ero&path=Ariel/pro
        const search = decodeURI(props.location.search);
        if (search.length < 5) {
            return {
                containerName: null,
                dirPath: null
            };
        }
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

        return {
            containerName: containerName,
            dirPath: dirPath
        };
    }

    render(): JSX.Element {
        if (!this.state.containers) {
            return <Loading />;
        }

        return (
            <Router history={history}>
                <Switch>
                    <Route
                        exact={true}
                        path="/"
                        component={
                            (props: RouteComponentProps) =>
                                <ContainerExplorer
                                    storage={this.state.storage} containers={this.state.containers}
                                    isSearch={true} path={MainRouter.getPathFromSearch(props)} {...props} />} />
                    <Route
                        path="*/*.html"
                        component={
                            (props: RouteComponentProps) =>
                                <ContainerExplorer
                                    storage={this.state.storage} containers={this.state.containers}
                                    isSearch={true} path={MainRouter.getPathFromSearch(props)} {...props} />} />
                    <Route
                        path="/:containerName/:dirPath*"
                        component={
                            (props: RouteComponentProps<{ containerName: string; dirPath?: string }>) =>
                                <ContainerExplorer
                                    storage={this.state.storage} containers={this.state.containers} isSearch={false}
                                    path={props.match.params}{...props} />} />
                </Switch>
            </Router>
        );
    }
}
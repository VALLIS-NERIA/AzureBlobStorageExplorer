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
    sasUrl?: string;
    urlPrefix?: string;
    useMatch?: boolean;
}

interface IRouterState {
    prefix: string;
    storage: Storage;
    containers: Container[];
}

const history = createBrowserHistory();

export class MainRouter extends React.Component<IRouterProp, IRouterState> {
    constructor(props: IRouterProp) {
        super(props);

        let url: string;
        if (props.sasUrl) {
            url = props.sasUrl;
        }
        else {
            url = null;
            const node = document.getElementById("sasUrl");
            if (node && node.innerText.trim().startsWith("http")) {
                url = node.innerText.trim();
            }
        }

        this.state = {
            prefix: this.formatPrefix(this.props.urlPrefix),
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
        if (search.length < 2) {
            return {
                containerName: null,
                dirPath: null
            };
        }
        try {
            // remove ? then split
            let a = search.substring(1).split("&");
            if (a.length === 1 && a[0].split("=").length===1) {
                const r = new RegExp("/*([^/]+)/*(.*)");
                const match = a[0].match(r);
                [, containerName, dirPath] = match;
            }
            else {
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

    // the returned prefix should begin with a slash, and has no trailing slashes
    private formatPrefix(prefix?: string): string {
        if (!prefix || prefix === "") {
            return "";
        }

        while (prefix.endsWith("/")) {
            prefix = prefix.substring(0, prefix.length - 1);
        }

        while (prefix.startsWith("/")) {
            prefix = prefix.substring(1, prefix.length);
        }

        if (prefix.length === 0) return "";

        return "/" + prefix;
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
                        path={`${this.state.prefix}/`}
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
                    {this.props.useMatch
                        ? <Route
                              path={`${this.state.prefix}/:containerName/:dirPath*`}
                              component={(props: RouteComponentProps<{ containerName: string; dirPath?: string }>) =>
                                  <ContainerExplorer
                                      storage={this.state.storage} containers={this.state.containers} isSearch={false}
                                      path={props.match.params}{...props} />} />
                        : null}
                </Switch>
            </Router>
        );
    }
}
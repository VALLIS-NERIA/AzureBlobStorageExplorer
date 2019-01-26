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
import * as Utils from "../Misc/Utils";

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
            else {
                throw new Error("No SAS provided.");
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
                                    isSearch={true} path={Utils.getPathFromSearch(props.location.search)} {...props} />} />
                    <Route
                        path="*/*.html"
                        component={
                            (props: RouteComponentProps) =>
                                <ContainerExplorer
                                    storage={this.state.storage} containers={this.state.containers}
                                    isSearch={true} path={Utils.getPathFromSearch(props.location.search)} {...props} />} />
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
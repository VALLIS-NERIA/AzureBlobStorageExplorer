import {
    Storage,
    Container,
    AzurePath
} from "../../azureExplorer";

import * as React from "react";
import { Router, Route, RouteComponentProps, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";
import { ContainerExplorer } from "../ContainerExplorer/ContainerExplorer";
import { Loading } from "../Misc/Loading";
import * as Utils from "../Misc/Utils";
import * as Environment from "../../Environment";

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

        return `/${prefix}`;
    }

    render(): JSX.Element {
        if (!this.state.containers) {
            return <Loading/>;
        }

        const matchUrlGenerator = (routeProps: RouteComponentProps<AzurePath>, path: AzurePath) => {
            return Utils.getDirFullPathNotSearch(routeProps.location.pathname, path.containerName, path.dirPath);
        };

        const searchUrlGenerator = (routeProps: RouteComponentProps, path: AzurePath) => {
            return Utils.getDirFullPathSearch(routeProps.location.pathname, path.containerName, path.dirPath);
        };

        return (
            <Router history={history}>
                <Switch>
                    <Route
                        exact={true}
                        path={`${this.state.prefix}/`}
                        component={
                            (props: RouteComponentProps) => {
                                Environment.EnvironmentManager.setRouterPathLink((p) => searchUrlGenerator(props, p));
                                return <ContainerExplorer
                                           storage={this.state.storage}
                                           containers={this.state.containers}
                                           path={Utils.getPathFromSearch(props.location.search)}/>
                            }}/>
                    <Route
                        path="*/*.html"
                        component={
                            (props: RouteComponentProps) => {
                                Environment.EnvironmentManager.setRouterPathLink((p) => searchUrlGenerator(props, p));
                                return <ContainerExplorer
                                           storage={this.state.storage}
                                           containers={this.state.containers}
                                           path={Utils.getPathFromSearch(props.location.search)}/>
                            }}/>
                    {this.props.useMatch
                        ? <Route
                              path={`${this.state.prefix}/:containerName/:dirPath*`}
                              component={
                                  (props: RouteComponentProps<AzurePath>) => {
                                      Environment.EnvironmentManager.setRouterPathLink(
                                          (p) => matchUrlGenerator(props, p));
                                      return <ContainerExplorer
                                                 storage={this.state.storage}
                                                 containers={this.state.containers}
                                                 path={props.match.params}/>
                                  }}/>
                        : null}
                </Switch>
            </Router>
        );
    }
}
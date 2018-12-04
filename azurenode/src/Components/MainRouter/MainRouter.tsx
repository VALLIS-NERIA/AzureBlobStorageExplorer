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

interface IExplorerProp {
    url?: string;
}

interface IExplorerState {
    url?: string;
    storage: Storage;
    containers: Container[];
}

const history = createBrowserHistory();

export class MainRouter extends React.Component<IExplorerProp, IExplorerState> {
    constructor(props: IExplorerProp) {
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
                            (props: RouteComponentProps<{ containerName: string; dirPath?: string }>) =>
                                <ContainerExplorer
                                    sasUrl={this.state.url} storage={this.state.storage} containers={this.state.containers}
                                    isSearch={false} containerName={null} dirPath={null} {...props} />} />
                    <Route
                        path="*/index.html"
                        component={
                            (props: RouteComponentProps<{ containerName: string; dirPath?: string }>) =>
                                <ContainerExplorer
                                    sasUrl={this.state.url} storage={this.state.storage} containers={this.state.containers}
                                    isSearch={true} search={props.location.search} {...props} />} />
                    <Route
                        path="/:containerName/:dirPath*"
                        component={
                            (props: RouteComponentProps<{ containerName: string; dirPath?: string }>) =>
                                <ContainerExplorer
                                    sasUrl={this.state.url} storage={this.state.storage} containers={this.state.containers}
                                    isSearch={false} containerName={props.match.params.containerName} dirPath={props.match.params.dirPath} {...props} />} />
                </Switch>
            </Router>
        );
    }
}
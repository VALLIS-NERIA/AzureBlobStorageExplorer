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
import { BrowserRouter, Router, Route, Link } from "react-router-dom";
import { createBrowserHistory, createHashHistory, createMemoryHistory } from "history";
import { ContainerExplorer } from "../ContainerExplorer/ContainerExplorer";

interface IExplorerProp {
    url: string;
}

interface IExplorerState {
    storage: Storage;
    containers: Container[];
}

const history = createBrowserHistory();

export class MainRouter extends React.Component<IExplorerProp, IExplorerState> {
    constructor(props: IExplorerProp) {
        super(props);
        this.state = { storage: new Storage(props.url), containers: null };
    }



    render(): JSX.Element {
        const ele: JSX.Element[] = [];
        if (this.state.containers) {
            for (const container of this.state.containers) {
                ele.push(
                    <li key={container.name}>
                        <Link to={`/${container.name}`}>
                            {container.name}
                        </Link>
                    </li>);
            }
        }
        return (
            <Router history={history}>
                <div>
                    <Route exact={true} path="/" render={() => <ul>{ele}</ul>} />
                    <Route exact={true} path="*/*.html" render={() => <ul>{ele}</ul>} />
                    <Route path="/:containerName/:dirPath*" component={(props) => <ContainerExplorer sasUrl={this.props.url} isSearch={false} storage={this.state.storage} containers={this.state.containers} {...props}/>}/>
                    <Route path="*/index.html?" component={(props) => <ContainerExplorer sasUrl={this.props.url} isSearch={true} storage={this.state.storage} containers={this.state.containers} {...props}/>}/>
                </div>
            </Router>
        );
    }
}
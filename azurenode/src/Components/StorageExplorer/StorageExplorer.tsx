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

const getComponentsWithProps = (nextState, cb) => {
    const explorer = (props) => <ContainerExplorer {...props} item={"Left Item"}/>;
    cb(null, { explorer });
};

const history = createBrowserHistory();

export class StorageExplorer extends React.Component<IExplorerProp, IExplorerState> {
    constructor(props: IExplorerProp) {
        super(props);
        this.state = { storage: new Storage(props.url), containers: null };
        this.getContainers();
    }

    async getContainers(): Promise<void> {
        const list: Container[] = [];
        for await (const container of this.state.storage.enumerateContainers()) {
            list.push(container);
        }
        this.setState({ containers: list });
    }

    render(): JSX.Element {
        return (
            <Router history={history}>
                <div>
                    {this.containerList()}
                    <Route path="/:containerName/:dirPath*" component={(props) => <ContainerExplorer storage={this.state.storage} containers={this.state.containers} {...props}/>}/>
                </div>
            </Router>
        );
    }

    containerList(): JSX.Element {
        const ele: JSX.Element[] = [];
        if (!this.state.containers) {
            return <div>Loading...</div>;
        }

        for (const container of this.state.containers) {
            ele.push(
                <li key={container.name}>
                    <Link to={`/${container.name}`}>
                        {container.name}
                    </Link>
                </li>);
        }
        return <Route exact={true} path="/" render={() => <ul>{ele}</ul>}/>;
    }


    //containerElement(): JSX.Element {
    //    const cts = this.state.containers;


    //    return (
    //        <div>
    //            <h3>ID: {props.match.params.container}</h3>
    //        </div>
    //    );
    //}

    refresh(arg: any) {
        this.forceUpdate();
    }
}
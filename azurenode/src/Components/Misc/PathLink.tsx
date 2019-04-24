import {
    Storage,
    Container,
    Blob,
    Directory,
    ItemList,
    IItem,
    ItemType,
    AzurePath,
    AzureLocation
} from "../../azureExplorer";

import * as React from "react";
import { BrowserRouter, Router, Route, Link, RouteComponentProps, Switch } from "react-router-dom";
import { createBrowserHistory, createHashHistory, createMemoryHistory } from "history";
import { ContainerExplorer } from "../ContainerExplorer/ContainerExplorer";
import { Loading } from "../Misc/Loading";
import * as Utils from "../Misc/Utils";

interface IPathLinkProps {
    style?: React.CSSProperties;
    children: any;
    path: AzurePath;
}

export enum PathLinkRenderMode {
    RouterLink = "RouterLink",
    ClickCallback = "ClickCallback"
}

export class PathLink extends React.Component<IPathLinkProps, {}> {
    static pathLinkGenerator: (path: AzurePath) => string;
    static clickCallback: (path: AzurePath) => void;
    static renderMode: PathLinkRenderMode = undefined;

    constructor(props) {
        super(props);
    }

    render() {
        switch (PathLink.renderMode) {
        case PathLinkRenderMode.RouterLink:
                return <Link style={this.props.style} to={PathLink.pathLinkGenerator(this.props.path)}> {this.props.children} </Link>;
            break;
        case PathLinkRenderMode.ClickCallback:
            return (
                <a
                    style={this.props.style}
                    href="javascript:;"
                    onClick={() => { PathLink.clickCallback(this.props.path); }}>
                    {this.props.children}
                </a>);
            break;
        default:
            return (
                <a style={this.props.style} href={PathLink.pathLinkGenerator(this.props.path)}>
                    {this.props.children}
                </a>);
        }
    }
}
import { AzurePath, ISet } from "../../azureExplorer";
import * as React from "react";
import { Link } from "react-router-dom";
import { Environment, PathLinkRenderMode }from "../../Environment";

interface IPathLinkProps {
    className?: string;
    style?: React.CSSProperties;
    children: any;
    set: ISet;
}


export class PathLink extends React.Component<IPathLinkProps, {}> {
    constructor(props) {
        super(props);
    }

    render() {
        switch (Environment.pathLinkMode) {
        case PathLinkRenderMode.RouterLink:
            return <Link
                       className={this.props.className}
                       style={this.props.style}
                       to={Environment.pathLinkUrlGenerator(this.props.set.azPath)}>
                       {this.props.children}
                   </Link>;
            break;
        case PathLinkRenderMode.ClickCallback:
            return (
                <a
                    style={this.props.style}
                    href="javascript:;"
                    onClick={() => { Environment.pathLinkClickCallback(this.props.set); }}>
                    {this.props.children}
                </a>);
            break;
        default:
            return (
                <a
                    className={this.props.className}
                    style={this.props.style}
                    href={Environment.pathLinkUrlGenerator(this.props.set.azPath)}>
                    {this.props.children}
                </a>);
        }
    }
}
import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import * as Utils from "./Utils";
import {
    Container,
    Directory,
    ItemList,
    ISet
} from "../../azureExplorer";

const styles: any = require("./SmallComponents.module.less");

interface IHeaderProps {
    container?: string;
    dir?: string;
    basePath: string;
    isSearch: boolean;
}

export class Header extends React.Component<IHeaderProps, {}> {
    render(): React.ReactNode {
        if (!this.props.container) {
            return 
        }
        return this.getElement(this.extractRoutes());
    }

    private *extractRoutes(): IterableIterator<{ name: string, route: string }> {
        const generator = Utils.getDirFullPathGenerator(this.props.isSearch);
        yield { name: "Top", route: generator(this.props.basePath) };

        const dirPath = decodeURI(this.props.dir);
        yield { name: this.props.container, route: generator(this.props.basePath, this.props.container) };

        const dirs = dirPath.split("/");
        dirs.pop();
        let route = "";

        for (const dir of dirs) {
            route += dir + "/";
            yield { name: dir, route: generator(this.props.basePath, this.props.container, route) };
        }
    }

    private getElement(items: Iterable<{ name: string, route: string }>): React.ReactNode {
        const list: JSX.Element[] = [];
        for (const item of items) {
            list.push(<Link to={item.route}>{item.name}</Link>);
            list.push(<a>{">"}</a>);
        }
        return <div>{list}</div>;
    }
}
import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import * as Utils from "./Utils";
import {
    Container,
    Directory,
    ItemList,
    ISet,
    AzurePath
} from "../../azureExplorer";
import { PathLink } from "./PathLink";

const styles: any = require("./SmallComponents.module.less");

interface IHeaderProps {
    showTop?: boolean;
    set: ISet;
}

export class Header extends React.Component<IHeaderProps, {}> {
    render(): React.ReactNode {
        if (!this.props.set) {
            return null;
        }
        return this.getElement(this.extractRoutes());
    }

    /*private *extractRoutes(): IterableIterator<{ name: string, route: string }> {
        const generator = this.props.pathGenerator;
        yield { name: "Top", route: generator({containerName: null, dirPath: null}) };

        const dirPath = decodeURI(this.props.path.dirPath);
        yield { name: this.props.path.containerName, route: generator({ containerName: this.props.path.containerName }) };

        const dirs = dirPath.split("/");
        dirs.pop();
        let subdir = "";

        for (const dir of dirs) {
            subdir += dir + "/";
            yield { name: dir, route: generator({ containerName: this.props.path.containerName, dirPath: subdir }) };
        }
    }*/
    //private *extractRoutes(): IterableIterator<{ name: string, path: AzurePath }> {
    //    yield { name: "Top", path: { containerName: null, dirPath: null } };

    //    const dirPath = decodeURI(this.props.set.azPath.dirPath);
    //    yield {
    //        name: this.props.set.azPath.containerName,
    //        path: { containerName: this.props.set.azPath.containerName }
    //    };

    //    const dirs = dirPath.split("/");
    //    dirs.pop();
    //    let subdir = "";

    //    for (const dir of dirs) {
    //        subdir += dir + "/";
    //        yield { name: dir, path: { containerName: this.props.set.azPath.containerName, dirPath: subdir } };
    //    }
    //}

    private *extractRoutes(): IterableIterator<{ name: string, set: ISet }> {
        let set = this.props.set;
        while (set) {
            yield { name: set.name, set: set };
            set = set.getParent();
        }
    }

    private getElement(items: Iterable<{ name: string, set: ISet }>): React.ReactNode {
        const list: JSX.Element[] = [];
        let i = 0;
        for (const item of items) {
            list.push(<a key={i + "d"}>{">"}</a>);
            list.push(<PathLink set={item.set} key={i + "name"}>{item.name}</PathLink>);
            //list.push(<Link to={item.route} key={i + "name"}>{item.name}</Link>);
            i++;
        }
        return <div>{list.reverse()}</div>;
    }
}
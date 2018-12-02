"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_router_dom_1 = require("react-router-dom");
class ContainerExplorer extends React.Component {
    constructor(props) {
        super(props);
        let found = null;
        if (this.props.containers) {
            for (const container of this.props.containers) {
                if (container.name === this.props.match.params.containerName) {
                    found = container;
                }
            }
        }
        let set = found;
        if (this.props.match.params.dirPath) {
        }
        this.state = {
            container: found,
            set: found,
            containerName: this.props.match.params.containerName,
            itemList: null
        };
        this.getItems();
    }
    async getItems() {
        if (this.state.set) {
            const res = await this.state.set.getItemsList();
            await res.waitBlobMetadata();
            this.setState({ itemList: res });
        }
    }
    render() {
        if (this.state.itemList) {
            const items = this.state.itemList;
            const list = [];
            for (const dir of items.directories) {
                list.push(React.createElement("div", null,
                    " ",
                    `Dir: ${dir.path}`,
                    " "));
            }
            for (const blob of items.blobs) {
                const mime = blob.properties ? blob.properties.contentType : "";
                list.push(React.createElement("div", null,
                    React.createElement("a", { href: blob.url, target: "_blank", type: mime },
                        " ",
                        `Blob: ${blob.path}`,
                        " ")));
            }
            return React.createElement("div", null,
                " ",
                list,
                " ");
        }
        return React.createElement(react_router_dom_1.Link, { to: `${this.state.containerName}/111` },
            this.props.match.params.dirPath,
            " ");
        //return <div> {this.state.container?"YES":"NO"}{this.props.match.params.containerName}</div>;
    }
}
exports.ContainerExplorer = ContainerExplorer;
//# sourceMappingURL=ContainerExplorer.js.map
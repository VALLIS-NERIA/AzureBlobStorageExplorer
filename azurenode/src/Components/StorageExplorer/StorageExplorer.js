"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const azureExplorer_1 = require("../../azureExplorer");
const React = require("react");
const react_router_dom_1 = require("react-router-dom");
const history_1 = require("history");
const ContainerExplorer_1 = require("../ContainerExplorer/ContainerExplorer");
const getComponentsWithProps = (nextState, cb) => {
    const explorer = (props) => React.createElement(ContainerExplorer_1.ContainerExplorer, Object.assign({}, props, { item: "Left Item" }));
    cb(null, { explorer });
};
const history = history_1.createBrowserHistory();
class StorageExplorer extends React.Component {
    constructor(props) {
        super(props);
        this.state = { storage: new azureExplorer_1.Storage(props.url), containers: null };
        this.getContainers();
    }
    async getContainers() {
        var e_1, _a;
        const list = [];
        try {
            for (var _b = __asyncValues(this.state.storage.enumerateContainers()), _c; _c = await _b.next(), !_c.done;) {
                const container = _c.value;
                list.push(container);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.setState({ containers: list });
    }
    render() {
        return (React.createElement(react_router_dom_1.Router, { history: history },
            React.createElement("div", null,
                this.containerList(),
                React.createElement(react_router_dom_1.Route, { exact: true, path: "/:containerName", component: (props) => React.createElement(ContainerExplorer_1.ContainerExplorer, Object.assign({ storage: this.state.storage, containers: this.state.containers }, props)) }),
                React.createElement(react_router_dom_1.Route, { path: "/:containerName/:dirName", component: (props) => React.createElement(ContainerExplorer_1.ContainerExplorer, Object.assign({ storage: this.state.storage, containers: this.state.containers }, props)) }),
                React.createElement(react_router_dom_1.Route, { path: "*", component: () => React.createElement("div", null, "404") }))));
    }
    containerList() {
        const ele = [];
        if (!this.state.containers) {
            return React.createElement("div", null, "Loading...");
        }
        for (const container of this.state.containers) {
            ele.push(React.createElement("li", { key: container.name },
                React.createElement(react_router_dom_1.Link, { to: {
                        pathname: `/${container.name}`
                    } }, container.name)));
        }
        return React.createElement(react_router_dom_1.Route, { exact: true, path: "/", render: () => React.createElement("ul", null, ele) });
    }
    //containerElement(): JSX.Element {
    //    const cts = this.state.containers;
    //    return (
    //        <div>
    //            <h3>ID: {props.match.params.container}</h3>
    //        </div>
    //    );
    //}
    refresh(arg) {
        this.forceUpdate();
    }
}
exports.StorageExplorer = StorageExplorer;
//# sourceMappingURL=StorageExplorer.js.map
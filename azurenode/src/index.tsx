import * as React from "react";
import { MainRouter } from "./Components/MainRouter/MainRouter";
import * as ReactDOM from "react-dom";

let sas: string;
try {
    sas = require("./sas.ts").default;
} catch (e) {
    sas = null;
}

ReactDOM.render(<MainRouter sasUrl={sas} useMatch={true}/>, document.getElementById("root"));
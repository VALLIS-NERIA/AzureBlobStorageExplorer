import { main } from "./azuretest";
import * as React from "react";
import { StorageExplorer } from "./Components/StorageExplorer/StorageExplorer";
import * as ReactDOM from "react-dom";
import sasUrl from "./sas"
// main();

ReactDOM.render(
    <StorageExplorer url={sasUrl} />,
    document.getElementById("root"));
import { main } from "./azuretest";
import * as React from "react";
import { MainRouter } from "./Components/MainRouter/MainRouter";
import * as ReactDOM from "react-dom";
import sasUrl from "./sas"
// main();

ReactDOM.render(
    <MainRouter url={sasUrl} />,
    document.getElementById("root"));
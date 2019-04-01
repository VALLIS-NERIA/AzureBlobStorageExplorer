import * as React from "react";
import { MainRouter } from "./Components/MainRouter/MainRouter";
import * as ReactDOM from "react-dom";
import GalleryView from "./Components/GalleryView/GalleryView";

let sas: string;
try {
    sas = require("./sas.ts").default;
} catch (e) {
    sas = null;
}

ReactDOM.render(<MainRouter sasUrl={sas} useMatch={true}/>, document.getElementById("root"));
//ReactDOM.render(<GalleryView sasUrl={sas} container="ero" dir="test/Camoshirt-01of02_771" />, document.getElementById("root"));

window["makeGallery"] = function(sas: string, cont: string, dir: string) {
    ReactDOM.render(
        <GalleryView sasUrl={sas} container={cont} dir={dir}/>,
        document.getElementById("root"));
}
import * as React from "react";
import { MainRouter } from "./Components/MainRouter/MainRouter";
import * as ReactDOM from "react-dom";
import GalleryView from "./Components/GalleryView/GalleryView";
import "office-ui-fabric-core/dist/css/fabric.css";

let sas: string;
try {
    sas = require("./sas.ts").default;
} catch (e) {
    sas = null;
}

//ReactDOM.render(<MainRouter sasUrl={sas} useMatch={true}/>, document.getElementById("root"));
//ReactDOM.render(<GalleryView sasUrl={sas} container="ero" dir="test/Camoshirt-01of02_771" />, document.getElementById("root"));

window["makeGallery"] =
    (arg: { sas?: string, cont: string, dir: string, col?: string, rootName?: string, autoMasonry?: boolean }) => {
        ReactDOM.render(
            <GalleryView
                sasUrl={arg.sas ? arg.sas : sas}
                container={arg.cont}
                dir={arg.dir}
                column={arg.col ? arg.col : null}
                autoMasonry={arg.autoMasonry}/>,
            document.getElementById(arg.rootName ? arg.rootName : "root"));
    }
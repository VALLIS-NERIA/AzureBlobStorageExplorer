import * as React from "react";
import * as ReactDOM from "react-dom";
import GalleryView from "./Components/GalleryView/GalleryView";

window["makeGallery"] =
    async function(arg: {
        sas: string,
        cont: string,
        dir: string,
        col?: string,
        rootName?: string,
        autoMasonry?: boolean,
        thumb?: string
    }): Promise<void> {
        ReactDOM.render(
            <GalleryView
                sasUrl={arg.sas}
                container={arg.cont}
                dir={arg.dir}
                column={arg.col ? arg.col : null}
                autoMasonry={arg.autoMasonry ? true : false}
                thumbSize={arg.thumb.length > 0 ? arg.thumb : null}/>,
            document.getElementById(arg.rootName ? arg.rootName : "root"));
    }
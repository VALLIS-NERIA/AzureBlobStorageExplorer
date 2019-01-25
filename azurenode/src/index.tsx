import * as React from "react";
import { MainRouter } from "./Components/MainRouter/MainRouter";
import { ImageView } from "./Components/ImageView/ImageView";
import * as ReactDOM from "react-dom";

let sas: string;
try {
    sas = require("./sas.ts").default;
} catch (e) {
    sas = null;
}


const imgs = [
    "https://c6.staticflickr.com/9/8520/28357073053_cafcb3da6f_n.jpg",
    "https://c8.staticflickr.com/9/8104/28973555735_ae7c208970_n.jpg"
];

ReactDOM.render(<MainRouter sasUrl={sas} />, document.getElementById("root"));
//ReactDOM.render(<ImageView imgs={imgs} />, document.getElementById("root"));
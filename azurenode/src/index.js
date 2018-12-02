"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const StorageExplorer_1 = require("./Components/StorageExplorer/StorageExplorer");
const ReactDOM = require("react-dom");
// main();
ReactDOM.render(React.createElement(StorageExplorer_1.StorageExplorer, { url: "https://backupstroage.blob.core.windows.net/?sv=2017-11-09&ss=bfqt&srt=sco&sp=rwdlacup&se=2018-12-09T15:59:59Z&st=2018-12-01T06:42:27Z&spr=https,http&sig=dpuR5vGLBHRYeclGYzcYb%2F4D5v4nLhjcaflkyNB68DE%3D" }), document.getElementById("root"));
//# sourceMappingURL=index.js.map
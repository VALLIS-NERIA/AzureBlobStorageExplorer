"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
var app = express();
app.use('/static', express.static(__dirname + "/static"));
app.get("/$", (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.sendFile(`${__dirname}/index.html`);
});
app.get("*", (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.sendFile(`${__dirname}/index.html`);
});
// Allows you to set port in the project properties.
app.set("port", process.env["PORT"] || 3000);
var server = app.listen(app.get("port"), function () {
    console.log("listening");
});
var ttt = 1;
//# sourceMappingURL=server.js.map
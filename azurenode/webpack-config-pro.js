const dev = require("./webpack-config.js");
dev.mode = "production";
dev.output.filename = `release-${dev.output.filename}`;
module.exports = dev;
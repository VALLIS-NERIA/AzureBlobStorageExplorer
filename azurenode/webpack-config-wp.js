const dev = require("./webpack-config.js");

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
dev.mode = "production";
dev.output.filename = `release-${dev.output.filename}`;
dev.plugins = [new BundleAnalyzerPlugin()];
module.exports = dev;
dev.externals = {
    jquery: 'jQuery',
    react: 'React',
    "react-dom": 'ReactDOM'
};
dev.output.filename = `wp-${dev.output.filename}`;

module.exports = dev;
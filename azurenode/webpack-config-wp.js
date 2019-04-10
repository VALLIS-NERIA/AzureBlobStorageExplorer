const dev = require("./webpack-config.js");
const path = require("path");

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
dev.entry = "./src/wp_gallery.tsx";
dev.module.rules[0].exclude = [/node_modules/, /index\.tsx/];
dev.mode = "production";
dev.plugins = [new BundleAnalyzerPlugin()];
dev.externals = {
    jquery: 'jQuery',
    react: 'React',
    "react-dom": 'ReactDOM',
    "@azure/storage-blob": 'azblob'
    //lightgallery: 'lg'
};
dev.output.filename = `wp-release-${dev.output.filename}`;

module.exports = dev;
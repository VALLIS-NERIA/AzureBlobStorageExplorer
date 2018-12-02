const path = require('path')
module.exports = {
    devtool: "source-map",
    entry: "./src/index.tsx",
    mode: "development",
    output: {
        filename: "app-bundle.js",
        path: path.resolve(__dirname, 'dist/static')
    },
    resolve: {
        extensions: [".Webpack.js", ".web.js", ".ts", ".tsx", ".js", ".jsx"]
    },
    module: {
        rules: [
            {
                test: /\.tsx|\.ts$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "ts-loader"
                }
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: "style-loader"
                    }, {
                        loader: "css-loader"
                    }, {
                        loader: "less-loader"
                    }
                ]
            }
        ]
    }
};
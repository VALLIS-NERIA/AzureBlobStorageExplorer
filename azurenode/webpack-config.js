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
                test: /\.module\.less$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            modules: true,
                            importLoaders: 2,
                            localIdentName: "azure-[name]-[local]"
                        }
                    },
                    "less-loader"
                ]
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 1,
                            localIdentName: "azure-[name]-[local]"
                        }
                    }
                ]
            }
        ]
    }
};
const path = require("path")
module.exports = {
    devtool: "source-map",
    entry: "./src/index.tsx",
    mode: "development",
    output: {
        filename: "app-bundle.js",
        path: path.resolve(__dirname, "dist/static")
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
                    loader: "ts-loader",
                    options: {

                    }
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
                            importLoaders: 0,
                            localIdentName: "azure-[name]-[local]"
                        }
                    },
                    "less-loader"
                ]
            },
            {
                test: /^((?!\.module).)*less$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            modules: true,
                            importLoaders: 0,
                            localIdentName: "[local]"
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
                            localIdentName: "[name]"
                        }
                    }
                ]
            },
            {
                test: /\.(eot|woff2|woff|ttf|svg|gif|png)/,
                loader: "url-loader"
            }
        ]
    }
};
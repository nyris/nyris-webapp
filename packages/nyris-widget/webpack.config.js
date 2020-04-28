const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: "production",
    target: 'node',

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", '.js', '.jsx'],
        alias: {
            react: path.resolve('./node_modules/react')
        },
    },

    plugins: [
        new CopyPlugin([ { from: 'public', to: 'dist'} ])
    ],


    entry: './src/index.tsx',

    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                use: [
                    { loader: "ts-loader" }
                ]
            },
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            },
            {
                test: /\.s?css$/,
                use: ["style-loader", "css-loader", 'sass-loader']
            },
            {
                test: /\.svg$/,
                use: ['@svgr/webpack', 'url-loader'],
            }
        ]
    },
    output: {
        filename: "widget.js",
        path: path.resolve(__dirname, "dist"),
        libraryTarget: 'var',
        library: 'NyrisWidget'
    },

    devServer: {
        contentBase: path.resolve(__dirname, "public"),
        port: 3000,
        overlay: true
    }
};

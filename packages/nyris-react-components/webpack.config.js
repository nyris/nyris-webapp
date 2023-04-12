let path = require('path');
let nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: "production",
    target: 'web',

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", '.js', '.jsx']
    },

    externals: [ nodeExternals({modulesFromFile: true})],

    entry: './src/index.tsx',

    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: [
                    /node_modules/
                ],
                use: [
                    {
                        loader: "ts-loader"
                    }
                ]
            },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            },
            {
                test: /\.css$/,
                use: [
                        "style-loader",
                        { loader: 'css-loader', options: { importLoaders: 1 } },
                        "postcss-loader"
                    ]
            },
            {
                test: /\.svg$/,
                use: ['@svgr/webpack', 'url-loader'],
            }
        ]
    },
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist"),
        libraryTarget: 'commonjs2',
        library: 'nyris-react-components'
    }
};

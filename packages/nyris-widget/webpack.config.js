const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

const IS_ENTERPRISE = process.env.IS_ENTERPRISE;

module.exports = {
  mode: "production",
  target: "node",

  // Enable sourcemaps for debugging webpack's output.
  devtool: "eval-source-map",

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      react: path.resolve("./node_modules/react"),
    },
  },

  plugins: [
    new CopyPlugin([{ from: "public", to: "" }]),
    new webpack.DefinePlugin({
      "process.env.IS_ENTERPRISE": IS_ENTERPRISE ? true : null,
    }),
  ],

  entry: "./src/index.tsx",

  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader",
      },
      {
        test: /\.s?css$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.svg$/,
        use: ["@svgr/webpack", "url-loader"],
      },
    ],
  },
  output: {
    filename: IS_ENTERPRISE ? "widget.js" : "widget-demo.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "var",
    library: "NyrisWidget",
  },

  devServer: {
    contentBase: path.resolve(__dirname, "public"),
    port: 3000,
    overlay: true,
  },
};

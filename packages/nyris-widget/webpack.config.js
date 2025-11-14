const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

const IS_ENTERPRISE = process.env.IS_ENTERPRISE;

module.exports = {
  mode: "production",
  target: "web",

  // Enable sourcemaps for debugging webpack's output.
  devtool: "eval-source-map",

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      react: path.resolve("../../node_modules/react"),
    },
  },

  plugins: [
    new CopyPlugin([{ from: "public", to: "" }]),
    new webpack.DefinePlugin({
      "process.env.IS_ENTERPRISE": JSON.stringify(IS_ENTERPRISE ? true : ""),
    }),
  ],

  entry: "./src/index.tsx",

  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: [
          /node_modules/,
          /packages\/(?!nyris-widget)/
        ],
        include: [
          path.resolve(__dirname, "src"),
        ],
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-react",
              "@babel/preset-typescript"
            ],
            plugins: [
              "@babel/plugin-proposal-class-properties",
              "@babel/proposal-object-rest-spread",
              "@babel/plugin-transform-runtime"
            ],
          },
        },
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
    static: {
      directory: path.resolve(__dirname, "public"),
    },
    client: {
      overlay: true,
    },
    port: 3000,
  },
};

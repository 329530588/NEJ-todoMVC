const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const extractPlugin = new ExtractTextPlugin({
    filename: './static/app.css'
});

module.exports = {
  devtool: "cheap-eval-source-map",
  entry: ["./src/todo.js", "webpack-dev-server/client?http://localhost:2333"],
  output: {
    filename: "./dist/bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            sourceMap: true
          }
        }
      },
      {
        test: /nej\-commonjs/,
        loader: "imports-loader?this=>window"
      },
      {
        test: /\.html$/,
        loader: "raw-loader"
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: extractPlugin.extract({
            use: ['css-loader', 'sass-loader']
        })
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      DEBUG: JSON.stringify(false), // 是否为 debug 模式
      CMPT: JSON.stringify(true) // 是否开启兼容模式，即 `NEJ.C('xxx')`
    }),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({ template: "./src/index.html" }),
    extractPlugin
  ],
  devServer: {
    publicPath: "/",
    port: 2333,
    host: "localhost",
    hot: true // hot module replacement. Depends on HotModuleReplacementPlugin
  }
};

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const { srcPath } = require("./path");

module.exports = {
  /**多入口 */
  entry: {
    index: path.join(srcPath, "index.js"),
    print: path.join(srcPath, "print.js"),
  },
  module: {
    /**loader执行顺序 从后往前 */
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            /**转es6 */
            presets: ["@babel/preset-env"],
          },
        },
      },
      /**
       * css-loader 解析.css文件 支持 import './xxx.css'
       * style-loader将含有 CSS 字符串的 <style> 标签，将被插入到 html 文件的 <head> 中。
       * postcss-loader css兼容性 增加前缀
       */
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  plugins: [
    /*多出口 */
    new HtmlWebpackPlugin({
      template: path.join(srcPath, "index.html"),
      filename: "index.html",
      // 表示该页面要引用哪些chunk vendor-第三方插件代码分割 common-公共模块
      chunks: ["index", "vendor", "common"],
    }),
    new HtmlWebpackPlugin({
      template: path.join(srcPath, "print.html"),
      filename: "print.html",
      chunks: ["print", "common"],
    }),
  ],
};

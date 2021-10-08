const path = require("path");
const webpack = require("webpack");
const { merge } = require("webpack-merge");

const conmmonConfig = require("./webpack.common");
const { distPath } = require("./path");

module.exports = merge(conmmonConfig, {
  mode: "development",
  module: {
    rules: [
      /**file-loader 处理图片（直接引入图片url） 可以轻松地将图片混合到 CSS 中：*/
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ["file-loader"],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      ENV: JSON.stringify("development"),
    }),
  ],
  /**配置本地服务器 */
  devServer: {
    port: 8080,
    compress: true, // 显示打包进度条
    // contentBase: distPath, // 根目录
    open: true, // 自动打开浏览器
    compress: true, // 启动 gzip压缩
    proxy: {
      // 本地代理
      "/api": "http: //localhost:3000",
    },
  },
});

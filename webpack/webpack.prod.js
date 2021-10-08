const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // 抽离css
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserJsPlugin = require("terser-webpack-plugin");
const { merge } = require("webpack-merge"); // 合并公共配置

const conmmonConfig = require("./webpack.common");
const { distPath } = require("./path");

module.exports = merge(conmmonConfig, {
  mode: "production",
  output: {
    filename: "js/[name].[contenthash:8].js", // contentHash 内容改变hash值才会变
    path: distPath,
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: {
          loader: "url-loader",
          options: {
            /**小于5kb的图片用base64格式 产出
             * 否则依然用file-loader产出url格式
             */
            limit: 5 * 1024,
            /**打包到img目录 */
            outputPath: "/img/",
          },
        },
      },
      /**抽离css */
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
      /**抽离scss */
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader",
          "postcss-loader",
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      ENV: JSON.stringify("production"),
    }),
    /**抽离css */
    new MiniCssExtractPlugin({
      filename: "css/main.[contenthash:8].css",
    }),
    /**
     * CommonsChunkPlugin 拆分代码  webpack v4 开始废弃
     * 通过将公共模块拆出来，最终合成的文件能够在最开始的时候加载一次，
     * 便存到缓存中供后续使用。这个带来速度上的提升，因为浏览器会迅速将公共的代码从缓存中取出来，
     * 而不是每次访问一个新页面时，再去加载一个更大的文件。
     */
    // new webpack.optimize.CommonsChunkPlugin({
    //   // 第三方库
    //   name: "vendor",
    //   filename: "vendor.js",
    //   test: /node_modules/,
    //   minChunks: 1, // 模块必须被1个 入口chunk 共享)
    //   minSize: 0,
    // }),
    // new webpack.optimize.CommonsChunkPlugin({
    //   // 公共代码
    //   name: "common", // 指定公共 bundle 的名称。
    //   filename: "common.js",
    //   minChunks: 2, // 模块必须被2个 入口chunk 共享)
    //   minSize: 0,
    // }),
  ],
  optimization: {
    /**
     * 压缩js
     * 压缩css*/
    minimizer: [new TerserJsPlugin(), new OptimizeCssAssetsPlugin()],
    /**分割代码块 */
    splitChunks: {
      chunks: "all",
      /**缓存分组 */
      cacheGroups: {
        /**第三方插件 */
        vendor: {
          name: "vendor",
          priority: 1, // 权限更高，优先抽离
          test: /[\\/]node_modules[\\/]/,
          minSize: 0,
          minChunks: 1, // 模块至少被1个 入口chunk 共享)
        },
        /**公共模块 */
        commons: {
          name: "common",
          priority: 0,
          minSize: 0,
          minChunks: 2,
        },
      },
    },
  },
});

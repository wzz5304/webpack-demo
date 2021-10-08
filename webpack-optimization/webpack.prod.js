const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // 抽离css
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserJsPlugin = require("terser-webpack-plugin");
const HappyPack = require("happypack");
const ParallelUglifyPlugin = require("webpack-parallel-uglify-plugin");
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
      // js
      {
        // 把.js文件的处理转给id为babel的happyPack实例
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: ["happypack/loader?id=babel"],
      },
      // 图片 考虑base64编码
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
    /**开启多进程打包 */
    new HappyPack({
      id: "babel",
      loaders: ["babel-loader?cacheDirectory"],
    }),
    /**多进程压缩js */
    new ParallelUglifyPlugin({
      // 传递给 UglifyJS的参数如下：
      uglifyJS: {
        output: {
          /*
           是否输出可读性较强的代码，即会保留空格和制表符，默认为输出，为了达到更好的压缩效果，
           可以设置为false
          */
          beautify: false,
          /*
           是否保留代码中的注释，默认为保留，为了达到更好的压缩效果，可以设置为false
          */
          comments: false,
        },
        compress: {
          /*
           是否删除代码中所有的console语句，默认为不删除，开启后，会删除所有的console语句
          */
          drop_console: true,

          /*
           是否内嵌虽然已经定义了，但是只用到一次的变量，比如将 var x = 1; y = x, 转换成 y = 5, 默认为不
           转换，为了达到更好的压缩效果，可以设置为false
          */
          collapse_vars: true,

          /*
           是否提取出现了多次但是没有定义成变量去引用的静态值，比如将 x = 'xxx'; y = 'xxx'  转换成
           var a = 'xxxx'; x = a; y = a; 默认为不转换，为了达到更好的压缩效果，可以设置为false
          */
          reduce_vars: true,
        },
      },
    }),
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

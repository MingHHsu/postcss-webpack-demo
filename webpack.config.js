const webpack = require('webpack');
const paths = require('./utils/paths');
const getEnv = require('./utils/env');
const WebpackBar = require('webpackbar');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const InterpolateHtmlPlugin = require('interpolate-html-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const env = getEnv();

module.exports = function() {
  return {
    mode: isDevelopment ? 'development' : isProduction && 'production',
    devtool: isDevelopment && 'cheap-module-source-map',
    entry: paths.appIndexJs,
    output: {
      path: paths.appBuild,
      filename: isProduction
        ? 'static/js/[name].[contenthash:8].js'
        : isDevelopment && 'static/js/[name].bundle.js',
      clean: true,
    },
    resolve: {
      modules: [paths.appSrc, paths.appNodeModules],
      extensions: ['.js', '.jsx', '.json'],
    },
    cache: {
      type: 'filesystem',
      cacheDirectory: paths.appWebpackCache,
    },
    devServer: {
      static: paths.appPublic,
      open: true,
      host: process.env.HOST || 'localhost',
      port: process.env.PORT || 3000,
      hot: true,
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/i,
          include: paths.appSrc,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
        {
          test: /\.pcss$/i,
          include: paths.appSrc,
          exclude: /node_modules/,
          use: [
            isDevelopment && 'style-loader',
            isProduction && MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: {
                  localIdentName: '[path]__[name]__[local]__[hash:base64:5]',
                }
              }
            },
            'postcss-loader'
          ].filter(Boolean),
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          include: paths.appSrc,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: isProduction
                  ? 'static/font/[name].[contenthash:8].[ext]'
                  : isDevelopment && 'static/font/[name].[ext]',
              },
            },
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          include: paths.appSrc,
          use: [
            {
              loader: 'url-loader',
              options: {
                name: isProduction
                  ? 'static/media/[name].[contenthash:8].[ext]'
                  : isDevelopment && 'static/media/[name].[ext]',
                limit: parseInt(
                  process.env.IMAGE_INLINE_SIZE_LIMIT || '10000'
                ),
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: true,
        template: paths.appHtml,
      }),
      isProduction &&
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
        }),
      new InterpolateHtmlPlugin(env.raw),
      new webpack.DefinePlugin(env.stringified),
      isDevelopment && new WebpackBar({
        profile: true,
        reporters: ['profile'],
      }),
      isDevelopment && new BundleAnalyzerPlugin({
        openAnalyzer: false,
      }),
    ].filter(Boolean),
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            parse: {
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
            },
          },
        })
      ],
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      },
    }, 
  };
};

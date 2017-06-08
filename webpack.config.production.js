'use strict';

const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const NpmImportPlugin = require('less-plugin-npm-import');

const banner = require('./dev/banner');
const VERSION = require('./package.json').version;

function getConfig(options) {

  const optimize = options.optimize || false;
  const minimize = optimize ? 'minimize' : '-minimize';
  const cssQuery = `css-loader?limit=32768?sourceMap&${minimize}&name=images/[name].[ext]`;

  const ENV_VAR = {
    'process.env': {
      'VERSION': JSON.stringify(VERSION),
      'process.env.NODE_ENV': JSON.stringify('production')
    }
  };

  const config = {

    context: __dirname,

    entry: {
      'availity-uikit': './js/index.js'
    },

    output: {
      path: path.join(__dirname, 'dist'),
      filename: optimize ? 'js/[name].min.js' : 'js/[name].js',
      library: 'availity-uikit',
      libraryTarget: 'umd',
      umdNamedDefine: true
    },

    externals: {
      'jquery': 'jQuery'
    },

    devtool: 'source-map',

    stats: {
      colors: true,
      reasons: true,
      hash: true,
      version: true,
      timings: true,
      chunks: true,
      chunkModules: true,
      cached: true,
      cachedAssets: true
    },

    module: {
      rules: [

        {
          test: /\.js$/,
          use: 'babel-loader',
          exclude: /(bower_components|node_modules)/
        },
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            user: 'css-loader'
          })
        },
        {
          test: /\.less$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              cssQuery,
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: true,
                  plugins: [
                    autoprefixer(
                      {
                        browsers: [
                          'last 5 versions',
                          'Firefox ESR',
                          'not ie < 9'
                        ]
                      }
                    )
                  ]
                }
              },
              {
                loader: 'less-loader'
              }
            ],
            publicPath: '../'
          })
        },
        {
          // test should match the following:
          //
          //  '../fonts/availity-font.eot?18704236'
          //  '../fonts/availity-font.eot'
          //
          test: /\.(ttf|woff|eot|svg).*/,
          use: 'file-loader?name=fonts/[name].[ext]'
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css', 'sass']
        },
        {
          test: /\.(jpe?g|png|gif)$/,
          use: 'url-loader?limit=32768?name=images/[name].[ext]'
        }
      ]
    },

    postcss() {
      return [autoprefixer({browsers: ['last 2 versions', 'ie 9-11']})];
    },

    lessLoader: {
      lessPlugins: [
        new NpmImportPlugin({
          prefix: '~'
        })
      ]
    },

    plugins: [

      new webpack.BannerPlugin({banner: banner()}),

      new webpack.optimize.OccurenceOrderPlugin(true),

      new ExtractTextPlugin({
        filename: optimize ? 'css/[name].min.css' : 'css/[name].css',
        disable: false,
        allChunks: true
      }),

      new webpack.NoErrorsPlugin(),

      new webpack.DefinePlugin(ENV_VAR)

    ],
    resolve: {
      extensions: ['.js']
    }
  };

  if (optimize) {
    config.plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        minimize: true,
        mangle: false,
        output: {
          comments: false
        },
        compressor: {
          screw_ie8: true,
          warnings: false
        }
      })
    );
  }

  return config;
}

module.exports = getConfig;

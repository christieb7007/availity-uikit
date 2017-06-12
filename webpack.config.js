const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const autoprefixer = require('autoprefixer');
const banner = require('./dev/banner');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');

const VERSION = require('./package.json').version;

const ENV_VAR = {
  'process.env': {
    'VERSION': JSON.stringify(VERSION),
    'process.env.NODE_ENV': JSON.stringify('development')
  }
};

const config = {
  context: __dirname,
  entry: {
    'availity-uikit': './js/index.js',
    'vendor': './docs/js/vendor',
    'docs': './docs/js'
  },

  resolve: {
    extensions: ['.js']
  },

  devtool: 'cheap-module-eval-source-map',

  output: {
    // if path is not set to '/build' => Error invalid argument in MemoryFileSystem.js.  Also,
    // `output.path` needs to be an absolute path or `/` else error
    path: path.join(__dirname, 'build'),
    filename: 'js/[name].js',
    library: 'availity-uikit',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },

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
          use: 'css-loader'
        })
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader?limit=32768?name=images/[name].[ext]',
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
        }
        )
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
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        use: 'url-loader?limit=32768?name=images/[name].[ext]'
      }
    ]
  },

  plugins: [
    new webpack.BannerPlugin({
      banner: banner(),
      exclude: ['vendor']
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new ExtractTextPlugin({
      filename: 'css/[name].css'
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    }),
    new WebpackNotifierPlugin({excludeWarnings: true}),
    new webpack.DefinePlugin(ENV_VAR),
    new CommonsChunkPlugin({
      name: ['vendor'],
      minChunks: Infinity
    })
  ]
};

module.exports = config;

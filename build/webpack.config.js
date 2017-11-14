const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const extractCss = new ExtractTextPlugin('main.[contenthash:8].css')
const extractAntd = new ExtractTextPlugin('antd.[contenthash:8].css')

const lessToJs = require('less-vars-to-js')
const themeVariables = lessToJs(
  fs.readFileSync(path.join(__dirname, '../ant-theme-vars.less'), 'utf-8')
)

const env = process.env.NODE_ENV || 'production'

const configPath = path.join(__dirname, `../config/${env}.js`)

module.exports = {
  entry: {
    main: path.join(__dirname, '../src'),
    vendor: ['react', 'react-dom', 'react-router-dom', 'mobx', 'mobx-react', 'core-js', 'moment']
  },
  // devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/',
    filename: '[name].[chunkhash:8].js',
    chunkFilename: '[name].chunk.[chunkhash:8].js'
  },
  plugins: [
    extractCss,
    extractAntd,
    new webpack.HashedModuleIdsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(env)
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
      minChunks: Infinity
    }),
    new webpack.optimize.CommonsChunkPlugin({
      async: true,
      children: true,
      minChunks: 4
    }),
    new HtmlWebpackPlugin({
      template: '../index.html',
      inject: true,
      growingLoader: env === 'production' ? `<script>${fs.readFileSync(path.join(__dirname, './growing.js'), 'utf-8')}</script>` : ''
    }),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-cn/),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        comparisons: false
      },
      output: {
        comments: false,
        ascii_only: true
      },
      sourceMap: false
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      '@': path.join(__dirname, '../'),
      'config': configPath
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        include: [
          path.join(__dirname, '../components'),
          path.join(__dirname, '../stores'),
          path.join(__dirname, '../src'),
          path.join(__dirname, '../lib'),
          path.join(__dirname, '../config')
        ]
      },
      {
        test: /\.css$/,
        include: path.join(__dirname, '../'),
        loader: extractCss.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      },
      {
        test: /\.less$/,
        use: extractAntd.extract({
          fallback: 'style-loader',
          use: ['css-loader', {
            loader: 'less-loader',
            options: {
              modifyVars: themeVariables
            }
          }]
        })
      },
      {
        test: /\.scss$/,
        use: extractCss.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      },
      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader'
      },
      {
        test: /\.(ttf|eot|svg|woff|woff2)(\?.+)?$/,
        loader: 'file-loader?name=[hash:12].[ext]'
      },
      {
        test: /\.(jpe?g|png|gif)(\?.+)?$/,
        loader: 'url-loader?name=[hash:12].[ext]&limit=25000'
      }
    ]
  }
}

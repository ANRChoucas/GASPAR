const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const ReplaceHashWebpackPlugin = require('replace-hash-webpack-plugin');
const { name, version } = require('./package.json');
const path = require('path');

module.exports = [
  {
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      hot: true,
      port: 9002,
    },
    entry: {
      app: './src/js/index.js',
    },
    output: {
      filename: '[name].[hash:6].js',
      publicPath: '',
    },
    mode: 'development',
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      browsers: [
                        'last 1 Chrome version',
                      ],
                    },
                  },
                ],
              ],
              plugins: ['syntax-dynamic-import'],
            },
          },
          exclude: [
            /node_modules/,
          ],
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: [
                  require('autoprefixer')(), // eslint-disable-line
                ],
              },
            },
          ],
        },
        {
          test: /\.(png|jpg|gif)$/,
          use: [
            {
              loader: 'url-loader',
            },
          ],
        },
        {
          // find these extensions in our css, copy the files to the outputPath,
          // and rewrite the url() in our css to point them to the new (copied) location
          test: /\.(woff(2)?|eot|otf|ttf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: {
            loader: 'file-loader',
            options: {
              outputPath: 'fonts/',
            },
          },
        },
      ],
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 0,
        cacheGroups: {
          ol: {
            test: /[\\/]node_modules[\\/](ol)[\\/]/,
            name: 'ol',
          },
          itownsthree: {
            test: /[\\/]node_modules[\\/](three|itowns)[\\/]/,
            name: 'itownsthree',
          },
          vendor: {
            test: /[\\/]node_modules[\\/](!ol)(!three)(!itowns)[\\/]/,
            name: 'vendor',
          },
        },
      },
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanAfterEveryBuildPatterns: ['dist/*.*'],
        watch: true,
      }),
      new webpack.ProvidePlugin({
        Promise: 'bluebird',
      }),
      new ReplaceHashWebpackPlugin({
        cwd: 'src',
        src: '**/*.html',
        dest: 'dist',
      }),
      new webpack.DefinePlugin({
        CHOUCAS_VERSION: JSON.stringify(version),
        APPLICATION_NAME: JSON.stringify(name),
      }),
      new FaviconsWebpackPlugin({
        logo: './src/img/logo-choucas-small.png',
        mode: 'webapp',
        devMode: 'webapp',
        favicons: {
          appName: name,
          icons: {
            android: false,
            appleIcon: false,
            appleStartup: false,
            coast: false,
            favicons: true,
            firefox: false,
            yandex: false,
            windows: false,
          },
        },
      }),
    ],
    watchOptions: {
      poll: true,
    },
  },
];

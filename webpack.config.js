const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PostcssPresetEnv = require('postcss-preset-env');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const AppManifestWebpackPlugin = require('app-manifest-webpack-plugin');

const sourceDir = path.join(__dirname, './src/');
const distDir = path.join(__dirname, './dist/');

module.exports = (env, argv) => {

  const devMode = argv.mode !== "production";

  return {
    resolve: {
      extensions: ['.js', '.jsx']
    },
    externals: {
      googleTagManager: 'dataLayer'
    },
    watchOptions: {
      poll: true,
    },
    node: {
      fs: 'empty',
    },
    entry: {
      app: `${sourceDir}index.jsx`,
    },
    output: {
      path: distDir,
      filename: devMode ? 'js/[name].js' : 'js/[name].[contenthash].js',
      publicPath: '/',
    },
    devtool: 'source-map',
    devServer: {
      historyApiFallback: true,
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['env', 'react', 'stage-0'],
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
            { loader: 'css-loader', options: { importLoaders: 1 } },
            {
              loader: 'postcss-loader', options: {
                ident: 'postcss',
                plugins: (ctx) => [
                  PostcssPresetEnv({
                    stage: 3,
                    features: {
                      'nesting-rules': true,
                      'color-mod-function': {
                        unresolved: 'warn'
                      }
                    }
                  })
                ]
              }
            }
          ]
        },
        {
          test: /\.woff2?$|\.ttf$|\.eot$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[hash].[ext]',
                outputPath: 'fonts/',
              },
            },
          ],
        },
        {
          test: /\.(gif|jpg|png|svg|)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[hash].[ext]',
                outputPath: 'images/',
              }
            }
          ],
        },
      ]
    },
    optimization: {
      minimizer: [
        new OptimizeCSSAssetsPlugin({}),
        new UglifyJsPlugin()
      ]
    },
    plugins: [
      new CleanWebpackPlugin([distDir]),
      new HtmlWebpackPlugin({
        template: `${sourceDir}index.ejs`,
        filename: `${distDir}index.html`,
        googleTagManager: 'GTM-KL4NB3Z'
      }),
      new MiniCssExtractPlugin({
        filename: devMode ? 'css/[name].css' : 'css/[name].[contenthash].css',
        chunkFilename: devMode ? '[id].css' : '[id].[contenthash].css'
      }),
      new CopyWebpackPlugin(
        [{ from: `${sourceDir}images/`, to: `${distDir}images/` }]
      ),
      new SWPrecacheWebpackPlugin({
        cacheId: 'get-saleor',
        filename: 'service-worker.js',
        staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
      }),
      new AppManifestWebpackPlugin({
        logo: `${sourceDir}images/favicon.png`,
        prefix: 'images/favicons/',
        output: 'images/favicons/', 
        emitStats: false,
        statsEncodeHtml: false,
        persistentCache: true,
        inject: true,
        config: {
          appName: 'Get Saleor', 
          appDescription: 'A GraphQL-first eCommerce platform for perfectionists. It is open sourced, PWA ready and stunningly beautiful. Find out why developers love it.',
          developerName: 'Mirumee Labs', 
          developerURL: 'https://mirumee.com/', 
          background: '#fff', 
          theme_color: '#fff', 
          display: 'standalone', 
          orientation: 'portrait', 
          start_url: '/', 
          version: '1.0', 
          logging: false, 
          icons: {
            android: true, 
            appleIcon: true, 
            appleStartup: true, 
            coast: { offset: 25 },
            favicons: true, 
            firefox: true, 
            windows: true, 
            yandex: false, 
          },
        }
      })
    ]
  }
};

const path = require('path')
const glob = require('glob')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const babelConfig = require('./babel.presets.js').config
const webpack = require('webpack')

const env = process.env.RELEASE_ENV || 'dev'

// add react-refresh
if (env === 'dev') {
  babelConfig.plugins.push('react-refresh/babel')
}

const config = {
  // allow resolution of imports without relative paths
  // I like this for domain scoping my app without boilerplate
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
  },
  // for the generic build options turn off optimizations
  optimization: {
    minimize: false,
    namedChunks: true,
    namedModules: true,
    sideEffects: false,
  },
  // by default deploy mode will be development (for webpack) but should
  // be overridden in env specific config files
  mode: 'development',

  // NOTE: no entry point defined here - this should be done
  // in the environment specific configs
  entry: {
    app: './src/entry.js',
  },

  // configure a standard output path - by default set to the current
  // file path directory and inside a dist directory then inside an
  // environment directory - this allows different builds for different
  // release environments
  output: {
    path: path.resolve(__dirname, './dist/' + env + '/'),
    publicPath: process.env.PUBLIC_PATH || '/hmr/',
    pathinfo: false,
  },
  // default to source map debugging tools
  devtool: 'source-map',

  // setup common module rules
  module: {
    rules: [
      // allow our babel config to tranpsile as is defined in the
      // babelConfig, also attempt to let babel cache source
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader?cacheDirectory',
          options: babelConfig,
        },
      },
      // configure css extraction plugin rules for loading - this is how
      // the extractor will know which files to extract instead of process
      // and package regularly
      {
        test: /\.[s]?css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        // use: ['css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    // define our RELEASE_ENV variable in the runtime build - this is useful
    // to decouple the NODE_ENV variable for library compatibility for
    // concerns like SSR
    new webpack.DefinePlugin({
      RELEASE_ENV: JSON.stringify(env),
    }),
    // allow webpack to extract CSS into a separate file output such that
    // it can be included separately for performance
    new MiniCssExtractPlugin(),
  ],
}

// export the main config creation - depending on the environment
// this can be tuned according to the `RELEASE_ENV` environment variable
// e.g. -
//  RELEASE_ENV=prod yarn webpack
module.exports = () => {
  const newConf = require(`./config/webpack.config.${env}.js`)(config)
  return newConf
}

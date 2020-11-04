const path = require('path')
const webpack = require('webpack')
const ManifestPlugin = require('webpack-manifest-plugin')
const MakeDirPlugin = require('make-dir-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
var nodeExternals = require('webpack-node-externals')
const TerserPlugin = require('terser-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')

module.exports = (config) => {
  const rules = config.module.rules.slice(0)
  rules[0].use.options.presets[1][1].development = true

  const clientConfig = {
    ...config,
    devtool: '',
    output: {
      ...config.output,
      filename: '[name].js',
      publicPath: '/static/',
    },
    module: {
      ...config.module,
      rules: rules,
    },
    resolve: {
      ...config.resolve,
      unsafeCache: true,
    },
    optimization: {
      minimize: true,
      runtimeChunk: 'single',
      moduleIds: 'hashed',
      removeAvailableModules: true,
      splitChunks: {
        minSize: 2000000,
        maxSize: 5000000,
        chunks: 'all',
        maxInitialRequests: 8,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            minSize: 0,
            maxSize: 5000000,
          },
        },
      },
    },
    mode: 'production',
    target: 'web',
    plugins: config.plugins.slice(0).concat([
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
      new ManifestPlugin({
        fileName: 'app.prod.manifest',
      }),
      new webpack.DefinePlugin({
        'process.env.RUNNING_ON_SERVER': false,
        'process.env.SSR_ENABLED': process.env.SSR_ENABLED || false,
      }),
      new LodashModuleReplacementPlugin({
        chaining: true,
        paths: true,
        collections: true,
      }),
    ]),
  }

  const serverConfig = {
    ...config,
    devtool: '',
    output: {
      ...config.output,
      filename: '[name].js',
    },
    mode: 'production',
    module: {
      ...config.module,
      rules: rules,
    },
    resolve: {
      ...config.resolve,
      unsafeCache: true,
    },
    target: 'node',
    externals: [
      nodeExternals({
        allowlist: [/\.(?!(?:jsx?|json)$).{1,5}$/i],
      }),
    ],
    entry: {
      'app.server': ['./src/entry.server.js'],
    },
    plugins: config.plugins.slice(0).concat([
      new CleanWebpackPlugin(),
      new ManifestPlugin({
        fileName: 'app.server.manifest',
      }),
      new webpack.DefinePlugin({
        'process.env.RUNNING_ON_SERVER': true,
        'process.env.SSR_ENABLED': process.env.SSR_ENABLED || false,
        'process.env.IS_SERVER': true,
      }),
      new LodashModuleReplacementPlugin({
        chaining: true,
        paths: true,
        collections: true,
      }),
      // TODO: define DLL plugin for speed-up
    ]),
  }

  return [clientConfig, serverConfig]
}

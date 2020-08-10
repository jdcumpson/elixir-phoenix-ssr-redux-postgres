const path = require('path')
const webpack = require('webpack')
const ManifestPlugin = require('webpack-manifest-plugin')
const MakeDirPlugin = require('make-dir-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
var nodeExternals = require('webpack-node-externals')

module.exports = (config) => {
  const rules = config.module.rules.slice(0)
  rules[0].use.options.presets[1][1].development = true

  const clientConfig = {
    ...config,
    devServer: {
      public: 'quickstart.dev:9900',
      publicPath: '/hmr/',
    },
    devtool: 'cheap-module-eval-source-map',
    output: {
      ...config.output,
      filename: '[name].dev.js',
    },
    module: {
      ...config.module,
      rules: rules,
    },
    resolve: {
      ...config.resolve,
      alias: {'react-dom': '@hot-loader/react-dom'},
      unsafeCache: true,
    },
    target: 'web',
    plugins: config.plugins.slice(0).concat([
      new webpack.HotModuleReplacementPlugin(),
      new ManifestPlugin({
        fileName: 'app.dev.manifest',
      }),
      new webpack.DefinePlugin({
        'process.env.RUNNING_ON_SERVER': false,
        'process.env.SSR_ENABLED': process.env.SSR_ENABLED || false,
      }),
      // TODO: define DLL plugin for speed-up
    ]),
  }

  const serverConfig = {
    ...config,
    devtool: 'cheap-module-eval-source-map',
    output: {
      ...config.output,
      filename: '[name].dev.js',
    },
    module: {
      ...config.module,
      rules: rules,
    },
    resolve: {
      ...config.resolve,
      alias: {'react-dom': '@hot-loader/react-dom'},
      unsafeCache: true,
    },
    target: 'node',
    externals: [
      nodeExternals({
        allowlist: [/\.(?!(?:jsx?|json)$).{1,5}$/i],
      }),
    ],
    entry: {
      'app.server': './src/entry.server.js',
    },
    plugins: config.plugins.slice(0).concat([
      new CleanWebpackPlugin(),
      new ManifestPlugin({
        fileName: 'app.server.manifest',
      }),
      new webpack.DefinePlugin({
        'process.env.RUNNING_ON_SERVER': true,
        'process.env.SSR_ENABLED': process.env.SSR_ENABLED || false,
      }),
      // TODO: define DLL plugin for speed-up
    ]),
  }

  return [clientConfig, serverConfig]
}

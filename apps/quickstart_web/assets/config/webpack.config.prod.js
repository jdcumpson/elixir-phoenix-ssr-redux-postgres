const copyWebpackPlugin = require('copy-webpack-plugin')

module.exports = (config) => {
  const common = {
    ...config,
  }

  const clientConfig = {
    ...common,
  }

  const serverConfig = {
    ...common,
    entry: {
      'app.server': './src/entry.server.js',
    },
  }

  return [clientConfig, serverConfig]
}

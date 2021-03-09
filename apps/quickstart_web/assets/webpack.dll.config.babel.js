import webpack from 'webpack'
import path from 'path'

export default {
  mode: 'development',
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(m|c)?js/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  entry: {
    dll: [
      'process',
      'stream-browserify',
      '@material-ui/core',
      'react',
      'react-dom',
      'react-refresh/runtime',
      'classnames',
      'lodash',
      'react-redux',
      'redux',
      '@material-ui/icons',
      // 'graphql',
      // 'graphql-tag',
      // 'moment',
      'redux-thunk',
      'react-responsive',
      'react-responsive-redux',
    ],
  },
  output: {
    path: path.join(__dirname, 'dist', 'dll'),
    filename: 'quickstart.[name].js',
    library: 'dll_[name]_[fullhash]',
  },
  plugins: [
    new webpack.DllPlugin({
      context: path.join(__dirname),
      path: path.join(__dirname, 'dist', 'dll', '[name]-manifest.json'),
      name: 'dll_[name]_[fullhash]',
    }),
  ],
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.dll.cache'),
  },
}

import path from 'path'
import nodeExternals from 'webpack-node-externals'
import LoadablePlugin from '@loadable/webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import webpack from 'webpack'
import svgToMiniDataURI from 'mini-svg-data-uri'
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import {WebpackManifestPlugin} from 'webpack-manifest-plugin'

const RELEASE_ENV = process.env.RELEASE_ENV || 'dev'
const DIST_PATH = path.resolve(__dirname, 'dist')
const production = process.env.RELEASE_ENV === 'production'

const getConfig = (target, appName) => {
  const plugins = [
    new webpack.DefinePlugin({
      'process.browser': target !== 'node',
      'process.env.RELEASE_ENV': JSON.stringify(RELEASE_ENV),
      'process.env.RUNNING_ON_SERVER': target === 'node' ? true : false,
    }),
    new LoadablePlugin(),
    new MiniCssExtractPlugin(),
    new WebpackManifestPlugin({
      writeToFileEmit: true,
      removeKeyHash: true,
      filter(fileDescriptor) {
        return fileDescriptor.isInitial
      },
    }),
  ]

  if (target !== 'node') {
    plugins.push(
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
    )
  }

  // TODO: fixup dll optimization
  // if (RELEASE_ENV !== 'prod') {
  //   plugins.push(
  //     new webpack.DllReferencePlugin({
  //       context: path.join(__dirname),
  //       manifest: require(path.join(__dirname, '/dist/dll/dll-manifest.json')), // eslint-disable-line
  //     }),
  //   )
  // }

  if (target !== 'node' && RELEASE_ENV !== 'prod') {
    plugins.push(new webpack.HotModuleReplacementPlugin())
    plugins.push(
      new ReactRefreshWebpackPlugin({
        library: `${target}_${appName}`,
      }),
    )
  }

  return {
    context: path.join(__dirname),
    name: `${target}_${appName}`,
    resolve: {
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      fallback: {
        buffer: require.resolve('buffer/'),
      },
      alias: {
        stream: require.resolve('stream-browserify'),
      },
    },
    mode: RELEASE_ENV === 'dev' ? 'development' : 'production',
    target,
    entry: {
      vendors:
        RELEASE_ENV === 'dev'
          ? ['react', 'react-dom', 'react-refresh/runtime']
          : ['react', 'react-dom'],
      main:
        target === 'node'
          ? `./src/entrypoints/${appName}/server.js`
          : RELEASE_ENV === 'dev'
          ? [
              `webpack-hot-middleware/client?name=${target}_${appName}&path=/sockjs-node&timeout=20000&reload=true`,
              `./src/entrypoints/${appName}/client.js`,
            ]
          : `./src/entrypoints/${appName}/client.js`,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          enforce: 'pre',
          use: ['source-map-loader'],
        },
        {
          test: /\.js?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              caller: {target, env: RELEASE_ENV},
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            'css-loader',
          ],
        },
        {
          test: /\.(m|c)?js/,
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.svg$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192 * 2,
                generator(content) {
                  return svgToMiniDataURI(content.toString())
                },
              },
            },
          ],
          // type: 'asset',
          // generator: {
          //   dataUrl(content) {
          //     return svgToMiniDataURI(content.toString())
          //   },
          // },
        },
        {
          test: /\.(png|jpg|jpeg)/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192 * 2,
              },
            },
          ],
        },
      ],
    },
    optimization: {
      moduleIds: 'deterministic',
      chunkIds: 'deterministic',
      runtimeChunk:
        target === 'web'
          ? {
              name: `runtime-${appName}`,
            }
          : undefined,
    },
    externals:
      target === 'node' ? ['@loadable/component', nodeExternals()] : undefined,
    output: {
      path: path.join(DIST_PATH, RELEASE_ENV, appName, target),
      filename:
        RELEASE_ENV === 'prod' ? '[name]-bundle-[chunkhash:8].js' : '[name].js',
      assetModuleFilename: '[name][ext]',
      publicPath: `/assets/${appName}/${target}/`,
      libraryTarget: target === 'node' ? 'commonjs2' : undefined,
      uniqueName: `${target}_${appName}`,
      library: target === 'node' ? undefined : `${target}_${appName}`,
      clean: true,
    },
    devtool: RELEASE_ENV === 'prod' ? undefined : 'eval-source-map',
    plugins: plugins,
    cache: {
      type: 'filesystem',
      cacheDirectory: path.resolve(__dirname, `.${target}-${appName}.cache`),
    },
  }
}

export default [
  getConfig('web', 'marketing'),
  getConfig('node', 'marketing'),
  // getConfig('web', 'auth'), // turn this on to compile the auth application
]

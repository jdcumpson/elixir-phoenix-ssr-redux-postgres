import 'core-js/stable'
import 'regenerator-runtime/runtime'
import 'whatwg-fetch'

import path from 'path'

import bodyParser from 'body-parser'
import express from 'express'
import {ChunkExtractor} from '@loadable/server'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import ServerStyleSheets from 'lib/ServerStyleSheets'

const app = express()
app.use(express.json())
app.use(bodyParser.json())

const RELEASE_ENV = process.env.RELEASE_ENV || 'dev'

if (RELEASE_ENV !== 'prod') {
  /* eslint-disable global-require, import/no-extraneous-dependencies */
  const webpackConfig = require('../../webpack.config.babel').default
  const webpackDevMiddleware = require('webpack-dev-middleware')
  const webpack = require('webpack')

  const compiler = webpack(webpackConfig)

  app.use(
    webpackDevMiddleware(compiler, {
      writeToDisk(filePath) {
        return (
          /dist\/.*\/.*main.js/.test(filePath) ||
          /loadable-stats/.test(filePath) ||
          /dist\/.*\/node\/.*/.test(filePath) ||
          /dist\/.*/.test(filePath)
        )
      },
    }),
  )
  app.use(
    require('webpack-hot-middleware')(compiler, {
      log: console.log,
      path: '/sockjs-node',
      heartbeat: 10 * 1000,
      dynamicPublicPath: true,
    }),
  )
}

export const renderString = (
  path = '/',
  appName = 'marketing',
  state = {},
  actions = [],
) => {
  const {nodeStats, webStats} = getStats(appName)

  const nodeExtractor = new ChunkExtractor({
    statsFile: nodeStats,
  })

  const ex = nodeExtractor.requireEntrypoint()
  const {default: getApplication} = ex

  const webExtractor = new ChunkExtractor({
    statsFile: webStats,
  })

  const {Application, store} = getApplication(path, state, actions)
  const sheets = new ServerStyleSheets({name: appName})

  const string = ReactDOMServer.renderToString(
    webExtractor.collectChunks(sheets.collect(<Application />)),
  )

  return [
    string,
    webExtractor.getScriptTags(),
    sheets.toString(),
    webExtractor.getStyleTags(),
    webExtractor.getLinkTags(),
    store.getState(),
  ]
}

const getStats = (appName) => {
  const nodeStats = path.resolve(
    __dirname,
    `../../dist/${RELEASE_ENV}/${appName}/node/loadable-stats.json`,
  )

  const webStats = path.resolve(
    __dirname,
    `../../dist/${RELEASE_ENV}/${appName}/web/loadable-stats.json`,
  )

  return {nodeStats, webStats}
}

app.all('/', (req, res) => {
  res.statusCode = 200
  const {state = {}, actions = [], app_name: appName} = req.body
  res.json(renderString(req.url, appName, state, actions))
})

app.listen(9005, () => console.log('Server started http://localhost:9005'))

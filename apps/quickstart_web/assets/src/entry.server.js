import 'router.js'
import http from 'http'
import fs from 'fs'
// import {Context as ResponsiveContext} from 'react-responsive'
import {createStore, applyMiddleware} from 'redux'
import {setMobileDetect, mobileParser} from 'react-responsive-redux'
import {Provider} from 'react-redux'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import {compose as reduxCompose} from 'redux'
import thunkMiddleware from 'redux-thunk'
import {ServerStyleSheets} from '@material-ui/core/styles'
import StyleContext from 'isomorphic-style-loader/StyleContext'

import Application from 'lib/application'
import reducer from 'reducer'

export const renderString = (path, state, actions) => {
  const compose = getCompose()
  const params = new Url(window.location.href, true).query
  let middleware = [thunkMiddleware]

  const applicationState = {}

  const store = createStore(
    reducer,
    {
      ...applicationState,
      ...window.__initialState,
    },
    compose(applyMiddleware.apply(null, middleware)),
  )

  // store.dispatch(setMobileDetect())
  actions.forEach((action) => store.dispatch(action))

  const sheets = new ServerStyleSheets()
  const css = new Set()
  // const insertCss = (...styles) =>
  //   styles.forEach((style) => css.add(style._getCss()))
  const insertCss = () => css

  const string = ReactDOMServer.renderToString(
    sheets.collect(
      <Provider store={store}>
        <StyleContext.Provider value={{insertCss}}>
          <Application />
        </StyleContext.Provider>
      </Provider>,
    ),
  )
  return [string, sheets.toString() + [...css].join(''), store.getState()]
}

const start = () => {
  try {
    const pid = fs.readFileSync('./prod-server.pid')
    process.kill(parseInt(pid), 'SIGKILL')
  } catch (err) {
    // nothing
  }

  fs.writeFileSync('./prod-server.pid', process.pid)

  const hostname = 'localhost'
  const port = 9411
  const server = http.createServer((req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    let body = ''
    req.on('data', (chunk) => {
      body += chunk.toString() // convert Buffer to string
    })
    req.on('end', () => {
      const {state, actions} = JSON.parse(body)
      res.end(JSON.stringify(renderString(req.url, state, actions)))
    })
  })

  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
  })
}

start()

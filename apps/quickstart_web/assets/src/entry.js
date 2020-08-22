import 'domains/application/router.js'

import {createStore, applyMiddleware} from 'redux'
import {Provider} from 'react-redux'
import React from 'react'
import ReactDOM from 'react-dom'
import {compose as reduxCompose} from 'redux'
import thunkMiddleware from 'redux-thunk'
import Url from 'url-parse'
import StyleContext from 'isomorphic-style-loader/StyleContext'

import history from 'lib/history'
import Application from './domains/application'
import {navigatePage} from 'domains/page/actions'
import reducer from 'domains/application/reducer'

const getCompose = () => {
  return window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : reduxCompose
}

const start = () => {
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

  history.listen(({location, action}) => {
    store.dispatch(navigatePage({action, location}))
  })

  store.dispatch(
    navigatePage({
      action: 'PUSH',
      location: {pathname: window.location.pathname},
    }),
  )

  const elem = document.getElementById('root')
  const hydrate = params.hydrate || process.env.SSR_ENABLED
  const render = hydrate ? ReactDOM.hydrate : ReactDOM.render

  if (module.hot) {
    module.hot.accept((...args) => console.error(args))
    module.hot.accept('domains/application/router.js', () => {
      // todo re-route
    })
    module.hot.accept('./domains/application/reducer', () => {
      const newRootReducer = require('./domains/application/reducer').default
      store.replaceReducer(newRootReducer)
    })
  }

  if (process.env.NODE_ENV === 'development') {
    window.store = store
  }

  render(
    <Provider store={store}>
      <StyleContext.Provider value={{insertCss: () => null}}>
        <Application />
      </StyleContext.Provider>
    </Provider>,
    elem,
  )
}

start()

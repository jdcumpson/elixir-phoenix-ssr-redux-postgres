import {loadableReady} from '@loadable/component'
import {createStore, applyMiddleware} from 'redux'
import {Provider} from 'react-redux'
import React from 'react'
import ReactDOM from 'react-dom'
import {compose as reduxCompose} from 'redux'
import thunkMiddleware from 'redux-thunk'
import Url from 'url-parse'
import {StylesProvider, createGenerateClassName} from '@material-ui/core/styles'

import history from 'lib/history'
import Application from 'domains/application/application'
import {navigatePage} from 'domains/application/actions'
import reducer from 'domains/application/reducer'

import 'domains/marketing/router'

const getCompose = () => {
  return window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({name: 'web_marketing'})
    : reduxCompose
}

const start = () => {
  const compose = getCompose()
  const params = new Url(window.location.href, true).query
  let middleware = [thunkMiddleware]

  const store = createStore(
    reducer,
    {
      ...window.__initialState,
      session: {
        user: 'user',
        turnCredential: 'foo',
      },
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

  const hydrate = params.hydrate || window.SSR_ENABLED
  let render = hydrate && !module.hot ? ReactDOM.hydrate : ReactDOM.render
  const elem = document.getElementById('root')

  const renderApp = () => {
    render(
      <Provider store={store}>
        <StylesProvider
          generateClassName={createGenerateClassName({
            seed: 'marketing',
            productionPrefix: 'marketing',
            disableGlobal: true,
          })}
        >
          <Application name="marketing" />
        </StylesProvider>
      </Provider>,
      elem,
    )
  }

  if (module.hot) {
    module.hot.accept('domains/application/reducer', () => {
      const newRootReducer = require('domains/application/reducer').default
      store.replaceReducer(newRootReducer)
    })
  }

  loadableReady(() => {
    renderApp()
  })
}

start()

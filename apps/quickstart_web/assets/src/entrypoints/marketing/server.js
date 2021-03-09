// because our server implementation does the bootstrapping outside of
// webpack - we just need to import the application and any global imports

import * as React from 'react'
import {createStore, applyMiddleware, compose} from 'redux'
import {Provider} from 'react-redux'
import thunkMiddleware from 'redux-thunk'
import Url from 'url-parse'

import 'domains/marketing/router'

import reducer from 'domains/application/reducer'
import {navigatePage} from 'domains/application/actions'
import Application from 'domains/application/application'

export default (path, state, actions) => {
  const params = new Url(path, true).query
  let middleware = [thunkMiddleware]

  const store = createStore(
    reducer,
    {
      ...state,
    },
    compose(applyMiddleware.apply(null, middleware)),
  )

  store.dispatch(
    navigatePage({
      action: 'PUSH',
      location: {pathname: path},
    }),
  )

  // store.dispatch(setMobileDetect())
  actions.forEach((action) => store.dispatch(action))

  return {
    Application: () => (
      <Provider store={store}>
        <Application name="marketing" />
      </Provider>
    ),
    store,
  }
}

import _ from 'lodash'
import pathToRegexp from 'path-to-regexp'

const routes = []
const cache = {}

function _route(name, path, renderNode, args = {}) {
  const keys = []
  const re = pathToRegexp(path, keys)
  return {
    name,
    re,
    renderNode: renderNode,
    args,
    keys,
    path,
    toPath: (params) => pathToRegexp.compile(path)(params),
  }
}

// debounce so that it doesn't do O(n^2) deletes, trailing edge
const clearCache = _.debounce(() => {
  for (const key in cache) {
    delete cache[key]
  }
}, 200)

export function route(name, path, renderNode, args) {
  clearCache()
  const route = _route(name, path, renderNode, args)
  routes.push(route)
  return route
}

export function error(renderNode, args) {
  clearCache()
  const index = _.findIndex(routes, {path: '/error'})
  const route = _route('error', '/error', renderNode, args)
  if (index > -1) {
    routes.splice(index, 1, route)
  } else {
    routes.push(route)
  }
  return route
}

export function getRoute(path) {
  if (cache[path]) {
    return cache[path]
  }

  return _.chain(routes)
    .find((route) => route.re.exec(path))
    .thru((route) => {
      // if no route is found, return an error route - but don't cache it
      if (!route) {
        return _.find(routes, (r) => r.re.exec('/error'))
      } else {
        // if a route is found, cache it
        cache[path] = route
        return cache[path]
      }
    })
    .value()
}

export const pathFor = (name, options = {}, urlOptions = {}) => {
  return _.chain(routes)
    .find((route) => route.name === name)
    .thru((route) => route.toPath(options))
    .value()
}

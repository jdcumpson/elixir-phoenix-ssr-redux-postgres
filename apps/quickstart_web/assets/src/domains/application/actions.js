import _ from 'lodash'
import {getRoute} from 'lib/route'
import history from 'lib/history'
import Url from 'url-parse'

export const navigateTo = (
  url,
  {
    replace = false,
    queryParams = {},
    keepQueryParams = false,
    scrollToTop = true,
  } = {},
) => {
  return (_dispatch, getState) => {
    const urlObj = new Url(url, true)
    const params = _.chain({})
      .merge(keepQueryParams ? new Url(window.location.href, true).query : {})
      .merge(urlObj.query)
      .merge(queryParams)
      .pickBy(_.identiy)
      .toPairs()
      .map((pair) => `${pair[0]}=${encodeURIComponent(pair[1])}`)
      .join('&')
      .value()

    const newUrl = `${urlObj.pathname}${params ? `?${params}` : ''}`
    const oldUrl = `${history.location.pathname}${history.location.search}`

    if (oldUrl === newUrl) {
      if (scrollToTop) {
        window.scrollTo(0, 0)
      }
      return
    }

    history.push({
      pathname: urlObj.pathname,
      search: params ? `?${params}` : '',
    })

    if (scrollToTop) {
      window.scrollTo(0, 0)
    }
  }
}

export const navigatePage = ({action, location}) => {
  return (dispatch, getState) => {
    const path = location.pathname
    const route = getRoute(path)
    let query = ''
    if (typeof window !== 'undefined') {
      new Url(window.location.href, true).query
    }
    const params = _.chain(route.re.exec(path))
      .slice(1)
      .thru((params) => _.zip(_.map(route.keys, 'name'), params))
      .fromPairs()
      .value()

    // TODO: gtag integration!

    dispatch({
      routeName: route.name,
      routerPath: route.path,
      type: 'app/navigatePage',
      path: location.pathname,
      routeConfig: route.args,
      params: {
        ...params,
        ...query,
      },
      action,
    })
  }
}

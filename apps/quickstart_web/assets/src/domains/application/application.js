import * as React from 'react'
import {useSelector} from 'react-redux'
import CssBaseline from '@material-ui/core/CssBaseline'
import {ThemeProvider} from '@material-ui/core'
import _ from 'lodash'

import {getRoute} from 'lib/route'
import theme from './theme'

function Application(props) {
  // Remove server-side rendered CSS once this is rendered on the client
  // this will replace the server-side rendered styles with client-side
  // rendered styles. In the best case scenario, this will have 0 user
  // effect until more client actions are taken.
  React.useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles) {
      // TODO: find out if this is working (css loader)
      jssStyles.parentElement.removeChild(jssStyles)
    }
  }, [])

  const page = useSelector((state) => state.app.page)
  const route = getRoute(page.path)
  const Node = route.renderNode

  if (!Node) {
    return null
  }

  return (
    <React.Fragment>
      {/* CssBaseline standardizes the CSS rules - similar to many modern css libraries */}
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <Node page={page} {..._.get(route, 'args.nodeProps', {})} />
      </ThemeProvider>
    </React.Fragment>
  )
}

export default Application

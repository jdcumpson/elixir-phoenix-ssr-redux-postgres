import React, {Suspense} from 'react'
import {useSelector} from 'react-redux'
import withStyles from 'isomorphic-style-loader/withStyles'
import styles from 'gestalt/dist/gestalt.css'
import CssBaseline from '@material-ui/core/CssBaseline'

import {getRoute} from 'lib/route'

function Application(props) {
  // Remove server-side rendered CSS once this is rendered on the client
  // this will replace the server-side rendered styles with client-side
  // rendered styles. In the best case scenario, this will have 0 user
  // effect until more client actions are taken.
  React.useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles)
    }
  }, [])

  const page = useSelector((state) => state.page)
  const route = getRoute(page.path)
  const Node = route.renderNode

  if (!Node) {
    return null
  }

  return (
    <React.Fragment>
      {/* CssBaseline standardizes the CSS rules - similar to many modern css libraries */}
      <CssBaseline />
      <Suspense fallback={null}>
        <Node page={page} {..._.get(route, 'args.nodeProps', {})} />
      </Suspense>
    </React.Fragment>
  )
}

export default withStyles(styles)(Application)

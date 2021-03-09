import * as React from 'react'
import loadable from '@loadable/component'

import {route, error} from 'lib/route'

// you can move this to it's own module in src/components when needed
function ErrorPage(props) {
  return <div>That's an error</div>
}

route(
  'root',
  '/',
  loadable(() => import('domains/marketing/home-page')),
  // loadable(() => import('domains/rtc/test')),
)

error(ErrorPage)

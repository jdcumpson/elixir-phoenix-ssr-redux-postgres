import React from 'react'
import {route, error} from 'lib/route'

import ErrorPage from 'domains/application/error'

route(
  'option',
  '/',
  React.lazy(() => import('../option')),
)
route(
  'option',
  '/:symbol/:date?/:priceAndType?',
  React.lazy(() => import('../option')),
)

error(ErrorPage)

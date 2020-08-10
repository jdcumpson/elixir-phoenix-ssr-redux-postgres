import {route, error} from 'lib/route'

import HomePage from 'domains/homepage'
import ItemPage from 'domains/itempage'
import ErrorPage from 'domains/application/error'

route('index', '/', HomePage)
route('item', '/item/:id', ItemPage)
error(ErrorPage)

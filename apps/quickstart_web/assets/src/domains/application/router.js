import {route, error} from 'lib/route'

import HomePage from 'domains/homepage'
import ItemPage from 'domains/itempage'
import OptionsPage from 'domains/options'
import OptionPage from 'domains/option'
import ErrorPage from 'domains/application/error'

route('option', '/', OptionPage)
route('item', '/item/:id', ItemPage)
route('options', '/options', OptionsPage)
route('optionsDate', '/options/:symbol/:type?/:date?', OptionsPage)
route('option', '/:symbol/:date?/:priceAndType?', OptionPage)

error(ErrorPage)

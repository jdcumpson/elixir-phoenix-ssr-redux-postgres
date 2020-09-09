import {route, error} from 'lib/route'

import HomePage from 'domains/homepage'
import ItemPage from 'domains/itempage'
import OptionsPage from 'domains/options'
import OptionPage from 'domains/option'
import PickerPage from 'domains/picker'
import ErrorPage from 'domains/application/error'

route('index', '/', HomePage)
route('item', '/item/:id', ItemPage)
route('options', '/options', OptionsPage)
route('optionsDate', '/options/:symbol/:type?/:date?', OptionsPage)
route('picker', '/:symbol/picker', PickerPage)
route('option', '/:symbol/:date?/:priceAndType?', OptionPage)

error(ErrorPage)

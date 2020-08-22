import {combineReducers} from 'redux'
// import {reducer as responsiveReducer} from 'react-responsive-redux'

import pageReducer from 'domains/page/reducer'
import homepageReducer from 'domains/homepage/reducer'
import itemReducer from 'domains/itempage/reducer'
import optionReducer from 'domains/options/reducer'

export default combineReducers({
  // responsive: responsiveReducer,
  page: pageReducer,
  homepage: homepageReducer,
  item: itemReducer,
  options: optionReducer,
})

import {combineReducers} from 'redux'
import {reducer as responsiveReducer} from 'react-responsive-redux'

const DEFAULT_STATE = {
  page: {path: '', params: {}, scrolling: false},
}

const basicReducer = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case 'app/navigatePage': {
      return {
        ...state,
        page: {
          ...state.page,
          ...action,
        },
      }
    }
    // TODO: delayedScroll library interaction for pages
    default: {
      return state
    }
  }
}

// you can customize this for each entry point in a domain
// specific file and just use the above reducer as one of
// many reducers
export default combineReducers({
  responsive: responsiveReducer,
  app: basicReducer,
})

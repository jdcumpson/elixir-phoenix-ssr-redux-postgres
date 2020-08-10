import {NAVIGATE_PAGE} from 'domains/page/actions'

const DEFAULT_PAGE_STATE = {
  path: '',
  params: {},
  scrolling: false,
}

export default (state = DEFAULT_PAGE_STATE, action) => {
  switch (action.type) {
    case NAVIGATE_PAGE: {
      return {
        ...state,
        ...action,
      }
    }
    // TODO: delayedScroll library interaction for pages
    default: {
      return state
    }
  }
}

const DEFAULT_PAGE_STATE = {
  path: '',
  params: {},
  scrolling: false,
}

export default (state = DEFAULT_PAGE_STATE, action) => {
  switch (action.type) {
    case 'page/navigatePage': {
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

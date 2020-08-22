import _ from 'lodash'

const DEFAULT_STATE = {
  companies: {
    receivedAt: null,
    requestedAt: null,
    fetching: false,
    data: [],
  },
  options: {
    fetching: false,
    bySymbol: {},
    predictions: {
      fetching: false,
      requestedAt: null,
      receivedAt: null,
      data: [],
    },
    customPrice: undefined,
  },
}

export default (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case 'options/requestCompanies': {
      return {
        ...state,
        companies: {
          ...state.companies,
          requestedAt: action.requestedAt,
          fetching: true,
        },
      }
    }
    case 'options/receiveCompanies': {
      return {
        ...state,
        companies: {
          ...state.options,
          receivedAt: action.receivedAt,
          fetching: false,
          data: action.companies,
          error: action.error,
        },
      }
    }
    case 'options/requestOptions': {
      return {
        ...state,
        options: {
          ...state.options,
          fetching: true,
          bySymbol: {
            ...state.options.bySymbol,
            [action.symbol]: {
              fetching: true,
              callExpirations: [],
              putExpirations: [],
            },
          },
        },
      }
    }
    case 'options/receiveOptions': {
      return {
        ...state,
        options: {
          ...state.options,
          fetching: false,
          bySymbol: {
            ...state.options.bySymbol,
            [action.symbol]: {
              receivedAt: action.receivedAt,
              fetching: false,
              data: action.companyDetailed,
              calls: action.calls,
              puts: action.puts,
              callExpirations: _.chain(action.calls)
                .map((option) => option.expiry)
                .uniq()
                .map((date) => ({value: date, label: date}))
                .value(),
              putExpirations: _.chain(action.puts)
                .map((option) => option.expiry)
                .uniq()
                .map((date) => ({value: date, label: date}))
                .value(),
            },
          },

          error: action.error,
        },
      }
    }
    case 'options/requestPredictions': {
      return {
        ...state,
        options: {
          ...state.options,
          predictions: {
            requestedAt: action.requestedAt,
            fetching: true,
            data: [],
          },
        },
      }
    }
    case 'options/receivePredictions': {
      return {
        ...state,
        options: {
          ...state.options,
          predictions: {
            receivedAt: action.receivedAt,
            fetching: false,
            data: action.data,
          },
        },
      }
    }
    case 'options/customPrice': {
      return {
        ...state,
        options: {
          ...state.options,
          customPrice: action.price,
        },
      }
    }
    default:
      return state
  }
}

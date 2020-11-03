import _ from 'lodash'
import hash from 'object-hash'

const DEFAULT_STATE = {
  companies: {
    receivedAt: null,
    requestedAt: null,
    fetching: false,
    data: [],
    currentSelection: {
      strikePrice: null,
      symbol: null,
    },
  },
  options: {
    fetching: false,
    bySymbol: {},
    currentSelection: [],
    expirations: {
      calls: [],
      puts: [],
    },
  },
  option: {
    fetching: false,
    predictions: {
      fetching: false,
      requestedAt: null,
      receivedAt: null,
      data: [],
    },
    option: null,
    args: {
      customPrice: undefined,
      strikePrice: undefined,
      type: 'call',
      date: undefined,
      symbol: undefined,
      minStrikePrice: undefined,
      maxStrikePrice: undefined,
    },
  },
}

function parseFloatOrUndefined(value) {
  const v = parseFloat(value)
  return _.isFinite(v) ? v : undefined
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
      const {symbol} = state.option.args
      const currentSelection = _.find(
        action.companies,
        (company) => company.symbol == symbol,
      )

      return {
        ...state,
        companies: {
          ...state.companies,
          receivedAt: action.receivedAt,
          fetching: false,
          data: action.companies,
          error: action.error,
          currentSelection: {
            ...currentSelection,
            ...state.companies.currentSelection,
          },
        },
      }
    }
    case 'options/requestOptions': {
      const {symbol} = state.option.args

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
        option: {
          ...state.option,
          fetching: symbol == state.option.args.symbol,
        },
      }
    }
    case 'options/receiveOptions': {
      const {date, strikePrice, symbol, type} = state.option.args

      const option =
        !_.isUndefined(date) &&
        _.isFinite(strikePrice) &&
        !_.isUndefined(symbol)
          ? _.chain(action)
              .get([type], [])
              .find(
                (option) =>
                  option.strikePrice == strikePrice && option.expiry == date,
              )
              .value() || null
          : null

      const currentSelection =
        !_.isUndefined(date) &&
        !_.isUndefined(symbol) &&
        symbol == action.symbol
          ? _.chain(action)
              .get([type], [])
              .filter((option) => option.expiry == date)
              .value() || []
          : []

      const callExpirations = _.chain(action)
        .get(['calls'])
        .map((opt) => opt.expiry)
        .uniq()
        .value()

      const putExpirations = _.chain(action)
        .get(['puts'])
        .map((opt) => opt.expiry)
        .uniq()
        .value()

      const expirations = {
        calls: callExpirations,
        puts: putExpirations,
      }

      return {
        ...state,
        companies: {
          ...state.companies,
          currentSelection: {
            ...state.companies.currentSelection,
            ...action.companyDetailed,
            tochlv: action.companyDetailed.tochlv.map((tochlv) => {
              return {
                t: tochlv.t,
                o: tochlv.o.toFixed(2),
                c: tochlv.c.toFixed(2),
                h: tochlv.h.toFixed(2),
                t: tochlv.t,
                l: tochlv.l,
              }
            }),
          },
        },
        options: {
          ...state.options,
          fetching: false,
          currentSelection,
          bySymbol: {
            ...state.options.bySymbol,
            [action.symbol]: {
              receivedAt: action.receivedAt,
              fetching: false,
              data: action.companyDetailed,
              calls: action.calls,
              puts: action.puts,
              expirations,
            },
          },
          expirations,
          error: action.error,
        },
        option: {
          ...state.option,
          fetching: false,
          option,
        },
      }
    }
    case 'options/requestPredictions': {
      return {
        ...state,
        option: {
          ...state.option,
          predictions: {
            requestedAt: action.requestedAt,
            fetching: true,
            data: [],
            hash: hash(action.variables),
          },
        },
      }
    }
    case 'options/receivePredictions': {
      if (
        state.option.predictions.requestedAt &&
        state.option.predictions.requestedAt != action.requestedAt
      ) {
        return state
      }

      const variableHash = hash(action.variables)
      if (state.option.predictions.hash != variableHash) {
        return state
      }

      const maxValue = _.maxBy(_.flatten(action.data), 'profit')

      return {
        ...state,
        option: {
          ...state.option,
          predictions: {
            receivedAt: action.receivedAt,
            fetching: false,
            data: action.data,
            maxProfit: _.get(maxValue, 'profit'),
            hash: null,
          },
        },
      }
    }
    case 'page/navigatePage': {
      if (action.routeName !== 'option') {
        return state
      }
      let {
        priceAndType,
        date,
        symbol,
        customPrice,
        maxStrikePrice,
        minStrikePrice,
      } = action.params
      const strikePrice = parseFloat(priceAndType)
      const type = priceAndType && priceAndType.endsWith('p') ? 'puts' : 'calls'
      customPrice = parseFloatOrUndefined(customPrice)
      maxStrikePrice = parseFloatOrUndefined(maxStrikePrice)
      minStrikePrice = parseFloatOrUndefined(minStrikePrice)

      const option =
        !_.isUndefined(date) &&
        _.isFinite(strikePrice) &&
        !_.isUndefined(symbol)
          ? _.chain(state.options.bySymbol)
              .get([symbol, type], [])
              .find((option) => {
                return (
                  option.strikePrice == strikePrice && option.expiry == date
                )
              })
              .value() || null
          : null

      const currentSelection =
        !_.isUndefined(date) && !_.isUndefined(symbol)
          ? _.chain(state.options.bySymbol)
              .get([symbol, type], [])
              .filter((option) => {
                return option.expiry == date
              })
              .value() || []
          : []

      let newArgs = {
        type,
        strikePrice: _.isFinite(strikePrice)
          ? strikePrice
          : state.option.args.strikePrice,
        date: !_.isUndefined(date) ? date : state.option.args.date,
        symbol: !_.isUndefined(symbol) ? symbol : state.option.args.symbol,
        customPrice,
        maxStrikePrice,
        minStrikePrice,
      }

      if (
        newArgs.symbol !== state.option.args.symbol &&
        state.option.args.symbol
      ) {
        newArgs = {
          symbol: newArgs.symbol,
          date: undefined,
          strikePrice: undefined,
          type,
          customPrice: undefined,
          maxStrikePrice: undefined,
          minStrikePrice: undefined,
        }
      }

      return {
        ...state,
        options: {
          ...state.options,
          currentSelection,
        },
        option: {
          ...state.option,
          option: !_.isNil(option) ? option : null,
          args: {
            ...state.option.args,
            ...newArgs,
          },
        },
      }
    }
    case 'options/updateArgs': {
      let {customPrice, maxStrikePrice, minStrikePrice} = action.params
      customPrice = parseFloatOrUndefined(customPrice)
      maxStrikePrice = parseFloatOrUndefined(maxStrikePrice)
      minStrikePrice = parseFloatOrUndefined(minStrikePrice)
      return {
        ...state,
        option: {
          ...state.option,
          args: {
            ...state.option.args,
            customPrice,
            maxStrikePrice,
            minStrikePrice,
          },
        },
      }
    }
    default:
      return state
  }
}

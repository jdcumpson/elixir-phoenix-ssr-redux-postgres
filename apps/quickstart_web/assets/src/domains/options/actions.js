import _ from 'lodash'
import {client} from 'lib/graphql'
import {gql} from '@apollo/client'
import hash from 'object-hash'

import {navigateTo} from 'domains/page/actions'

const FETCH_ALL_COMPANIES = gql`
  query FetchAllCompanies {
    companies {
      name
      symbol
    }
  }
`

const FETCH_OPTIONS = gql`
  query FetchOptions($symbols: [String!]!) {
    companiesDetailed(symbols: $symbols) {
      name
      symbol
      strikePrice
      tochlv {
        t
        o
        c
        h
        v
      }
      calls {
        price
        strikePrice
        expiry
        impliedVolatility
      }
      puts {
        price
        strikePrice
        expiry
        impliedVolatility
      }
    }
  }
`

const FETCH_CALL_PREDICTIONS = gql`
  query FetchCallPredictions(
    $symbols: [String!]!
    $expirations: [Date!]!
    $strikePrices: [Float!]!
    $minStrikePrice: Float
    $maxStrikePrice: Float
    $pricePaid: Float
    $numberOfContracts: Int
  ) {
    companiesDetailed(symbols: $symbols) {
      calls(expirations: $expirations, strikePrices: $strikePrices) {
        price
        strikePrice
        expiry
        impliedVolatility
        profitPredictions(
          minStrikePrice: $minStrikePrice
          maxStrikePrice: $maxStrikePrice
          pricePaid: $pricePaid
          numberOfContracts: $numberOfContracts
        ) {
          strikePrice
          pricePerOption
          profitPerContract
          profit
          daysUntilExpiry
          date
          cost
          costPerContract
          value
          valuePerContract
          theta
        }
      }
    }
  }
`

const FETCH_PUT_PREDICTIONS = gql`
  query FetchPutPredictions(
    $symbols: [String!]!
    $expirations: [Date!]!
    $strikePrices: [Float!]!
    $minStrikePrice: Float
    $maxStrikePrice: Float
    $pricePaid: Float
    $numberOfContracts: Int
  ) {
    companiesDetailed(symbols: $symbols) {
      puts(expirations: $expirations, strikePrices: $strikePrices) {
        price
        strikePrice
        expiry
        impliedVolatility
        profitPredictions(
          minStrikePrice: $minStrikePrice
          maxStrikePrice: $maxStrikePrice
          pricePaid: $pricePaid
          numberOfContracts: $numberOfContracts
        ) {
          strikePrice
          pricePerOption
          profitPerContract
          profit
          daysUntilExpiry
          date
          cost
          costPerContract
          value
          valuePerContract
          theta
        }
      }
    }
  }
`

export const fetchAllCompanies = () => async (dispatch, getState) => {
  if (_.get(getState(), 'options.companies.requestedAt')) {
    return
  }
  dispatch({type: 'options/requestCompanies', requestedAt: Date.now()})
  try {
    const result = await client.query({
      query: FETCH_ALL_COMPANIES,
    })
    dispatch({
      type: 'options/receiveCompanies',
      companies: result.data.companies,
      receivedAt: Date.now(),
    })
  } catch (error) {
    dispatch({type: 'options/receiveCompanies', error, receivedAt: Date.now()})
  }
}

function toFixed(value) {
  value = parseFloat(value)
  return _.isFinite(value) ? value : undefined
}

export const fetchOptions = (symbol) => async (dispatch, getState) => {
  if (!symbol) {
    return
  }
  symbol = symbol.toUpperCase()
  const optionsForSymbol = getState().options.options.bySymbol[symbol]
  if (_.get(getState(), `options.options.bySymbol[${symbol}].requestedAt`)) {
    return
  }
  const requestedAt = Date.now()

  dispatch({type: 'options/requestOptions', symbol, requestedAt})

  try {
    const result = await client.query({
      query: FETCH_OPTIONS,
      variables: {
        symbols: [symbol],
      },
    })
    dispatch({
      type: 'options/receiveOptions',
      symbol,
      companyDetailed: result.data.companiesDetailed[0],
      calls: result.data.companiesDetailed[0].calls,
      puts: result.data.companiesDetailed[0].puts,
      requestedAt,
      receivedAt: Date.now(),
    })
  } catch (error) {
    dispatch({
      type: 'options/receiveOptions',
      error,
      requestedAt,
      receivedAt: Date.now(),
    })
  }
}

export const fetchPredictions = (
  symbol,
  expiration,
  strikePrice,
  minStrikePrice,
  maxStrikePrice,
  pricePaid,
  numberOfContracts,
  type = 'call',
) => async (dispatch, getState) => {
  symbol = symbol.toUpperCase()
  const optionsForSymbol = getState().options.options.bySymbol[symbol]
  const requestedAt = Date.now()

  if (_.get(getState(), `options.options.bySymbol[${symbol}].requestedAt`)) {
    return
  }

  const variables = {
    symbols: [symbol],
    expirations: [expiration],
    strikePrices: [strikePrice],
    minStrikePrice: toFixed(minStrikePrice),
    maxStrikePrice: toFixed(maxStrikePrice),
    pricePaid: toFixed(pricePaid),
    numberOfContracts,
  }

  dispatch({
    type: 'options/requestPredictions',
    symbol,
    requestedAt,
    variables,
  })

  try {
    const result = await client.query({
      query: type == 'calls' ? FETCH_CALL_PREDICTIONS : FETCH_PUT_PREDICTIONS,
      variables,
    })

    const variableHash = hash(variables)
    if (variableHash !== getState().options.option.predictions.hash) {
      return
    }

    dispatch({
      type: 'options/receivePredictions',
      requestedAt,
      variables,
      receivedAt: Date.now(),
      data: _.get(
        result,
        ['data', 'companiesDetailed', 0, type, 0, 'profitPredictions'],
        [],
      ),
    })
  } catch (error) {
    console.info(error)
    dispatch({
      type: 'options/receivePredictions',
      error,
      requestedAt,
      receivedAt: Date.now(),
    })
  }
}

const navigate = (symbol, date, strikePrice, type, extraParams) => {
  let action = null
  if (symbol && date && strikePrice && type && extraParams) {
    const options = {
      queryParams: {
        ...extraParams,
      },
      scrollToTop: false,
    }
    action = navigateTo(`/${symbol}/${date}/${strikePrice}${type[0]}`, options)
  } else if (symbol && date && strikePrice && type) {
    action = navigateTo(`/${symbol}/${date}/${strikePrice}${type[0]}`)
  } else if (symbol && date && strikePrice) {
    action = navigateTo(`/${symbol}/${date}/${strikePrice}c`)
  } else if (symbol && date) {
    action = navigateTo(`/${symbol}/${date}`)
  } else {
    action = navigateTo(`/${symbol}`)
  }

  return action
}

// use to create new navigate parameters based on logic from the app
// - if changing symbol, reset all fields
// - if changing date, reset price, type, customprice
// - if changing price, reset type, customprice
export const updateOptionQuery = (args = {}, options = {}) => {
  return (dispatch, getState) => {
    const existingArgs = {...getState().options.option.args}
    const mergedArgs = _.merge({}, existingArgs, args)

    if (
      mergedArgs.type &&
      mergedArgs.strikePrice &&
      mergedArgs.date &&
      mergedArgs.symbol
    ) {
      dispatch(
        navigate(
          mergedArgs.symbol,
          mergedArgs.date,
          mergedArgs.strikePrice,
          mergedArgs.type,
          {
            customPrice: mergedArgs.customPrice,
            minStrikePrice: mergedArgs.minStrikePrice,
            maxStrikePrice: mergedArgs.maxStrikePrice,
          },
        ),
      )
    } else if (
      args.strikePrice &&
      mergedArgs.type &&
      mergedArgs.date &&
      mergedArgs.symbol
    ) {
      dispatch(
        navigate(
          mergedArgs.symbol,
          mergedArgs.date,
          mergedArgs.strikePrice,
          mergedArgs.type,
        ),
      )
    } else if (args.date && mergedArgs.symbol) {
      dispatch(navigate(mergedArgs.symbol, mergedArgs.date))
    } else if (args.symbol) {
      dispatch(navigate(mergedArgs.symbol))
    } else {
      console.error(
        'Unknown error, cannot update option query',
        args,
        options,
        mergedArgs,
      )
    }
  }
}

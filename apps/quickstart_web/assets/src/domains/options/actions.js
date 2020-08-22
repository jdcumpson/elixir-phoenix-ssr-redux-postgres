import _ from 'lodash'
import {client} from 'lib/graphql'
import {gql} from '@apollo/client'

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

export const fetchOptions = (symbol) => async (dispatch, getState) => {
  symbol = symbol.toUpperCase()
  const optionsForSymbol = getState().options.options.bySymbol[symbol]
  if (_.get(getState(), `options.options.bySymbol[${symbol}].requestedAt`)) {
    return
  }

  dispatch({type: 'options/requestOptions', symbol, requestedAt: Date.now()})
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
      receivedAt: Date.now(),
    })
  } catch (error) {
    dispatch({type: 'options/receiveOptions', error, requestedAt: Date.now()})
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
  if (_.get(getState(), `options.options.bySymbol[${symbol}].requestedAt`)) {
    return
  }

  dispatch({
    type: 'options/requestPredictions',
    symbol,
    requestedAt: Date.now(),
  })
  try {
    const result = await client.query({
      query: type == 'calls' ? FETCH_CALL_PREDICTIONS : FETCH_PUT_PREDICTIONS,
      variables: {
        symbols: [symbol],
        expirations: [expiration],
        strikePrices: [strikePrice],
        minStrikePrice,
        maxStrikePrice,
        pricePaid,
        numberOfContracts,
      },
    })
    dispatch({
      type: 'options/receivePredictions',
      receivedAt: Date.now(),
      data: _.get(
        result,
        ['data', 'companiesDetailed', 0, type, 0, 'profitPredictions'],
        [],
      ),
    })
  } catch (error) {
    dispatch({
      type: 'options/receivePredictions',
      error,
      requestedAt: Date.now(),
    })
  }
}

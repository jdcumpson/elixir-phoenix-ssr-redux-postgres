import React from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {useTheme, makeStyles} from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Chip from '@material-ui/core/Chip'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Autocomplete from '@material-ui/lab/Autocomplete'
import FormControl from '@material-ui/core/FormControl'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import Toolbar from '@material-ui/core/Toolbar'
import Grid from '@material-ui/core/Grid'
import InputAdornment from '@material-ui/core/InputAdornment'
import Skeleton from '@material-ui/lab/Skeleton'
import {VariableSizeList} from 'react-window'
import matchSorter from 'match-sorter'
import moment from 'moment'

import {ListboxComponent} from './options'
import {
  fetchAllCompanies,
  fetchOptions,
  fetchPredictions,
} from 'domains/options/actions'
import {navigateTo} from 'domains/page/actions'

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(4),
  },
  option: {
    marginTop: theme.spacing(2),
  },
  formControl: {
    marginTop: theme.spacing(2),
    display: 'block',
  },
  chip: {
    marginRight: theme.spacing(1),
    minWidth: 64,
  },
  cell: {
    height: 50,
    padding: theme.spacing(2),
    textAlign: 'center',
  },
  tableRoot: {
    padding: theme.spacing(1),
  },
  toolbar: {
    flexGrow: 1,
  },
}))

const deepGreen = [0, 204, 0]
const lightGreen = [160, 255, 160]
const lightRed = [255, 160, 160]
const deepRed = [243, 28, 28]

const convolve = ([red1, green1, blue1], [red2, green2, blue2], percent) => {
  const red = red1 + percent * (red2 - red1)
  const green = green1 + percent * (green2 - green1)
  const blue = blue1 + percent * (blue2 - blue1)
  return [red, green, blue]
}

const rgbify = ([red, green, blue]) => `rgb(${red}, ${green}, ${blue})`

const optionToRgb = (option) => {
  if (option.profit == 0) {
    return null
  }
  const color1 = option.profit > 0 ? deepGreen : deepRed
  const color2 = option.profit > 0 ? lightGreen : lightRed
  return rgbify(
    convolve(
      color1,
      color2,
      option.profit > 0
        ? option.cost / option.value
        : option.value / option.cost,
    ),
  )
}

export default function Option(props) {
  const styles = useStyles()
  const dispatch = useDispatch()
  const symbol = useSelector((state) => state.page.params.symbol)
  const date = useSelector((state) => state.page.params.date)
  const priceAndType = useSelector((state) => state.page.params.priceAndType)
  const optionsBySymbol = useSelector((state) => state.options.options.bySymbol)
  const strikePrice = parseFloat(priceAndType)
  const type =
    priceAndType && (priceAndType.endsWith('p') || priceAndType.endsWith('put'))
      ? 'puts'
      : 'calls'
  const companies = useSelector((state) => state.options.companies.data)
  const expirations =
    type === 'calls'
      ? _.get(optionsBySymbol, [symbol, 'callExpirations'], [])
      : _.get(optionsBySymbol, [symbol, 'putExpirations'], [])
  const companyData = _.get(optionsBySymbol, [symbol, 'data'], {})
  const option =
    _.chain(optionsBySymbol)
      .get([symbol, type], [])
      .find(
        (option) => option.strikePrice == strikePrice && option.expiry == date,
      )
      .value() || null
  const options =
    _.chain(optionsBySymbol)
      .get([symbol, type], [])
      .filter((option) => {
        return option.expiry == date
      })
      .value() || []
  const predictions = useSelector((state) => state.options.options.predictions)
  const customPriceText = useSelector((state) => state.page.params.customPrice)
  const _cp = parseFloat(customPriceText)
  const customPrice = _.isFinite(_cp) ? _cp : undefined

  const filterOptions = (companies, {inputValue}) => {
    return matchSorter(companies, inputValue, {
      keys: ['symbol'],
    })
  }

  React.useEffect(() => {
    dispatch(fetchAllCompanies())
  }, [symbol])

  React.useEffect(() => {
    dispatch(fetchOptions(symbol))
  }, [symbol])

  React.useEffect(() => {
    dispatch(fetchAllCompanies())
  })

  React.useEffect(() => {
    if (
      _.get(optionsBySymbol, [symbol, 'receivedAt']) &&
      !option &&
      date &&
      options.length == 0
    ) {
      dispatch(navigateTo(`/${symbol}/`))
    }
  }, [optionsBySymbol, symbol, option, date, options])

  React.useEffect(() => {
    if (!symbol || !date || !option) {
      return
    }
    dispatch(
      fetchPredictions(
        symbol,
        date,
        option.strikePrice,
        undefined,
        undefined,
        customPrice,
        undefined,
        type,
      ),
    )
  }, [symbol, date, option, customPrice])

  const priceChange = (price) => {
    const params = price
      ? {
          queryParams: {
            customPrice: price,
          },
        }
      : {queryParams: {}, keepQueryParams: false}
    dispatch(
      navigateTo(
        `/${symbol}/${date}/${option.strikePrice}${
          type == 'calls' ? 'c' : 'p'
        }`,
        params,
      ),
    )
  }

  return (
    <div className={styles.root}>
      <Paper>
        <Toolbar>
          <div className={styles.toolbar}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  id="symbol-selector"
                  filterOptions={filterOptions}
                  selectOnFocus
                  disableListWrap
                  options={companies}
                  classes={{
                    root: styles.option,
                  }}
                  ListboxComponent={ListboxComponent}
                  onChange={(event, company) => {
                    if (!company) {
                      return
                    }
                    dispatch(navigateTo(`/${company.symbol}/${date}`))
                  }}
                  value={
                    _.find(
                      companies,
                      (company) =>
                        company.symbol.toUpperCase() === symbol.toUpperCase(),
                    ) || {symbol: symbol, name: ''}
                  }
                  getOptionSelected={(option, value) => {
                    return _.isEqual(option, value)
                  }}
                  autoHighlight
                  getOptionLabel={(company) => `${company.name}`}
                  renderOption={(option) => (
                    <React.Fragment>
                      <Chip
                        classes={{root: styles.chip}}
                        color="primary"
                        label={option.symbol}
                      />{' '}
                      {option.name}
                    </React.Fragment>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Choose company"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Chip
                              classes={{root: styles.chip}}
                              color="primary"
                              label={symbol}
                            />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{
                        ...params.inputProps,
                        autoComplete: 'new-password', // disable autocomplete and autofill
                      }}
                    />
                  )}
                />
                <Autocomplete
                  id="date-selector"
                  selectOnFocus
                  options={expirations}
                  classes={{
                    root: styles.option,
                  }}
                  onChange={(event, option) => {
                    if (!option) {
                      return
                    }
                    dispatch(navigateTo(`/${symbol}/${option.value}`))
                  }}
                  getOptionSelected={(option, value) => {
                    return _.isEqual(option, value)
                  }}
                  value={date ? {value: date, label: date} : null}
                  autoHighlight
                  getOptionLabel={(option) => (option ? option.label : '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Choose expiration"
                      variant="outlined"
                      inputProps={{
                        ...params.inputProps,
                        autoComplete: 'new-password', // disable autocomplete and autofill
                      }}
                    />
                  )}
                />
                <Autocomplete
                  options={options}
                  classes={{
                    root: styles.option,
                  }}
                  selectOnFocus
                  onChange={(event, option) => {
                    if (!option) {
                      return
                    }
                    dispatch(
                      navigateTo(
                        `/${symbol}/${date}/${option.strikePrice}${
                          type == 'calls' ? 'c' : 'p'
                        }`,
                      ),
                    )
                  }}
                  getOptionSelected={(option, value) => {
                    return _.isEqual(option, value)
                  }}
                  value={option}
                  autoHighlight
                  getOptionLabel={(option) =>
                    option ? `${option.strikePrice.toFixed(2)}` : ''
                  }
                  renderOption={(option) => (
                    <React.Fragment>
                      {option.strikePrice.toFixed(2)}
                    </React.Fragment>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Choose option"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                      inputProps={{
                        ...params.inputProps,
                        autoComplete: 'new-password', // disable autocomplete and autofill
                      }}
                    />
                  )}
                />
                <FormControl className={styles.formControl} variant="outlined">
                  <InputLabel>Option type</InputLabel>
                  <Select
                    label="Option type"
                    value={type}
                    fullWidth
                    onChange={(event) => {
                      dispatch(
                        navigateTo(
                          `/${symbol}/${date}/${option.strikePrice}${
                            event.target.value == 'calls' ? 'c' : 'p'
                          }`,
                        ),
                      )
                    }}
                  >
                    <MenuItem value="calls">Call</MenuItem>
                    <MenuItem value="puts">Put</MenuItem>
                  </Select>
                </FormControl>

                <FormControl className={styles.formControl} variant="outlined">
                  <TextField
                    label="Custom option premium"
                    variant="outlined"
                    value={_.isFinite(customPrice) ? customPriceText : ''}
                    fullWidth
                    onChange={(event) => priceChange(event.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    }}
                    inputProps={{
                      autoComplete: 'new-password', // disable autocomplete and autofill
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={8}>
                <div>strike price: {companyData.strikePrice}</div>
                <div>option price: {option && option.price}</div>
                <div>
                  implied volatility: {_.get(option, 'impliedVolatility')}
                </div>
              </Grid>
            </Grid>
          </div>
        </Toolbar>
      </Paper>
      {predictions.data.length > 0 && (
        <Paper>
          <table className={styles.tableRoot}>
            <thead>
              <tr>
                <th className={styles.cell}></th>
                {_.chain(predictions.data[0])
                  .groupBy((prediction) =>
                    moment(prediction.date).format('YYYY-MMM'),
                  )
                  .toPairs()
                  .map(([date, predictions]) => (
                    <th
                      key={date}
                      className={styles.cell}
                      colSpan={predictions.length}
                    >
                      <div>{moment(date).format('MMM')}</div>
                    </th>
                  ))
                  .value()}
              </tr>
              <tr>
                <th className={styles.cell}></th>
                {predictions.data[0].map((prediction) => (
                  <th key={prediction.date} className={styles.cell}>
                    <div>{moment(prediction.date).format('D')}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {predictions.data.map((row, n) => (
                <tr key={n}>
                  <th className={styles.cell}>
                    {row[0].strikePrice.toFixed(2)}
                  </th>
                  {row.map((prediction) => (
                    <td
                      className={styles.cell}
                      style={{backgroundColor: optionToRgb(prediction)}}
                      key={`${prediction.price}${prediction.date}`}
                      onClick={() => console.info(prediction)}
                    >
                      {prediction.profit.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Paper>
      )}
    </div>
  )
}

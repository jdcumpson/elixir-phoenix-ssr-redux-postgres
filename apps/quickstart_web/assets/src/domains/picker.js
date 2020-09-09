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
import cx from 'classnames'

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
    marginBottom: theme.spacing(2),
  },
  formControl: {
    marginTop: theme.spacing(2),
    display: 'block',
  },
  chip: {
    marginRight: theme.spacing(1),
    minWidth: 64,
  },
  toolbar: {
    flexGrow: 1,
    padding: theme.spacing(2),
  },
  secondHalf: {
    marginTop: theme.spacing(2),
  },
}))

export default function Picker(props) {
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
    if (
      _.get(optionsBySymbol, [symbol, 'receivedAt']) &&
      !option &&
      date &&
      options.length == 0
    ) {
      dispatch(navigateTo(`/${symbol}/`))
    }
  }, [optionsBySymbol, symbol, option, date, options])

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
      <Paper classes={{root: styles.secondHalf}}>x</Paper>
    </div>
  )
}

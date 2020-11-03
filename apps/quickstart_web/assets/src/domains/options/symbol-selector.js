import React from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {makeStyles} from '@material-ui/core/styles'
import Autocomplete from '@material-ui/lab/Autocomplete'
import Chip from '@material-ui/core/Chip'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'
import matchSorter from 'match-sorter'

import Listbox from 'domains/options/listbox'
import {updateOptionQuery} from 'domains/options/actions'

const useStyles = makeStyles((theme) => ({
  option: {
    marginBottom: theme.spacing(2),
  },
  chip: {
    marginRight: theme.spacing(1),
    minWidth: 64,
  },
}))

const filterOptions = (companies, {inputValue}) => {
  return matchSorter(companies, inputValue, {
    keys: ['symbol', 'name'],
  })
}

export default function SymbolSelector(props) {
  const styles = useStyles()
  const dispatch = useDispatch()
  const companies = useSelector((state) => state.options.companies.data)
  const symbol = useSelector((state) => state.page.params.symbol)
  const date = useSelector((state) => state.page.params.date)
  const value =
    _.find(
      companies,
      (company) =>
        symbol && company.symbol.toUpperCase() === symbol.toUpperCase(),
    ) || null

  return (
    <Autocomplete
      id="symbol-selector"
      filterOptions={filterOptions}
      selectOnFocus
      disableListWrap
      options={companies}
      classes={{
        root: styles.option,
      }}
      ListboxComponent={Listbox}
      onChange={(event, company) => {
        if (!company) {
          return
        }
        dispatch(updateOptionQuery({symbol: company.symbol}))
      }}
      value={value}
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
            startAdornment: value && (
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
  )
}

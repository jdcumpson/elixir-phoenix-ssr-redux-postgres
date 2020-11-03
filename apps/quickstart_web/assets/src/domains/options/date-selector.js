import React from 'react'
import _ from 'lodash'
import {useSelector, useDispatch} from 'react-redux'
import {makeStyles} from '@material-ui/core/styles'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'

import {navigateTo} from 'domains/page/actions'
import {updateOptionQuery} from 'domains/options/actions'

const useStyles = makeStyles((theme) => ({
  option: {
    marginBottom: theme.spacing(2),
  },
}))

export default function DateSeletor(props) {
  const styles = useStyles()
  const dispatch = useDispatch()
  const {option} = useSelector((state) => state.options.option)
  const options = useSelector((state) => state.options.options.currentSelection)
  const {symbol, date, type} = useSelector((state) => state.options.option.args)
  const expirations = useSelector((state) => state.options.options.expirations)

  return (
    <Autocomplete
      id="date-selector"
      selectOnFocus
      disabled={!symbol}
      options={_.map(expirations[type], (datestring) => ({
        value: datestring,
        label: datestring,
      }))}
      classes={{
        root: styles.option,
      }}
      onChange={(event, option) => {
        if (!option) {
          return
        }
        dispatch(updateOptionQuery({date: option.value}))
      }}
      getOptionSelected={(option, value) => {
        return _.isEqual(option, value)
      }}
      value={date ? {value: date, label: date} : null}
      autoHighlight
      getOptionLabel={(option) => (option ? option.label : '')}
      focused={symbol && !date}
      variant="outlined"
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
  )
}

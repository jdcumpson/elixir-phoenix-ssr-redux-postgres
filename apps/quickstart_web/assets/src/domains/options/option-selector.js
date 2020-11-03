import React from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {makeStyles} from '@material-ui/core/styles'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'

import {navigateTo} from 'domains/page/actions'

const useStyles = makeStyles((theme) => ({
  option: {
    marginBottom: theme.spacing(2),
  },
}))

export default function OptionSelector(props) {
  const styles = useStyles()
  const dispatch = useDispatch()
  const {option} = useSelector((state) => state.options.option)
  const options = useSelector((state) => state.options.options.currentSelection)
  const {symbol, date, type} = useSelector((state) => state.options.option.args)

  return (
    <Autocomplete
      options={options}
      classes={{
        root: styles.option,
      }}
      disabled={!date}
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
        option
          ? `${option.strikePrice.toFixed(2)} - cost $${option.price.toFixed(
              2,
            )}`
          : ''
      }
      renderOption={(option) => (
        <React.Fragment>
          {option.strikePrice.toFixed(2)} - cost ${option.price.toFixed(2)}
        </React.Fragment>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Choose option"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
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

import React, {useCallback} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {makeStyles} from '@material-ui/core/styles'
import Slider from '@material-ui/core/Slider'
import Typography from '@material-ui/core/Typography'
import FormControl from '@material-ui/core/FormControl'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormLabel from '@material-ui/core/FormLabel'

import {updateOptionQuery} from 'domains/options/actions'

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(2),
    width: '100%',
    '& .MuiTextField-root': {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  },
  formControl: {
    marginRight: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}))

export default function PriceSlider(props) {
  const styles = useStyles()
  const dispatch = useDispatch()
  const strikePrice = useSelector(
    (state) => state.options.companies.currentSelection.strikePrice,
  )
  const {maxStrikePrice, minStrikePrice} = useSelector(
    (state) => state.page.params,
  )

  const minCallback = React.useCallback((event) => {
    dispatch(
      updateOptionQuery({
        minStrikePrice: event.target.value,
      }),
    )
  })

  const maxCallback = React.useCallback((event) => {
    dispatch(
      updateOptionQuery({
        maxStrikePrice: event.target.value,
      }),
    )
  })

  return (
    <div className={styles.root}>
      <TextField
        label="Graph min"
        variant="outlined"
        placeholder="auto"
        value={minStrikePrice || ''}
        onChange={minCallback}
        fullWidth
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>,
        }}
        inputProps={{
          autoComplete: 'new-password', // disable autocomplete and autofill
        }}
      />
      <TextField
        label="Graph max"
        variant="outlined"
        value={maxStrikePrice || ''}
        placeholder="auto"
        onChange={maxCallback}
        fullWidth
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>,
        }}
        inputProps={{
          autoComplete: 'new-password', // disable autocomplete and autofill
        }}
      />
    </div>
  )
}

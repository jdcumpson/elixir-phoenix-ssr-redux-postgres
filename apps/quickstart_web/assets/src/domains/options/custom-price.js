import React from 'react'
import _ from 'lodash'
import {useSelector, useDispatch} from 'react-redux'
import {makeStyles} from '@material-ui/core/styles'
import FormControl from '@material-ui/core/FormControl'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'

import {updateOptionQuery} from 'domains/options/actions'

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginTop: theme.spacing(2),
    display: 'block',
  },
}))

export default function CustomPrice(props) {
  const styles = useStyles()
  const dispatch = useDispatch()
  const {option} = useSelector((state) => state.options.option)
  const options = useSelector((state) => state.options.options.currentSelection)
  const {symbol, date, type} = useSelector((state) => state.options.option.args)
  const customPrice = useSelector((state) => state.page.params.customPrice)

  const priceChange = React.useCallback(
    (price) => {
      dispatch(updateOptionQuery({customPrice: price}))
    },
    [symbol, date, option, customPrice],
  )

  return (
    <FormControl className={styles.formControl} variant="outlined">
      <TextField
        label="(optional) Option premium paid"
        variant="outlined"
        value={customPrice || ''}
        placeholder={`${_.get(option, 'price', '')}`}
        fullWidth
        onChange={(event) => priceChange(event.target.value)}
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>,
        }}
        inputProps={{
          autoComplete: 'new-password', // disable autocomplete and autofill
        }}
      />
    </FormControl>
  )
}

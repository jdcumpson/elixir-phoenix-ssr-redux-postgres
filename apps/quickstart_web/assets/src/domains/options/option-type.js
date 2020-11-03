import React from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {makeStyles} from '@material-ui/core/styles'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'

import {updateOptionQuery} from 'domains/options/actions'

const useStyles = makeStyles((theme) => ({
  formControl: {
    display: 'block',
  },
}))

export default function OptionType(props) {
  const styles = useStyles()
  const dispatch = useDispatch()
  const {option} = useSelector((state) => state.options.option)
  const {type} = useSelector((state) => state.options.option.args)
  const callback = React.useCallback(
    (event) => {
      dispatch(
        updateOptionQuery({
          type: event.target.value,
        }),
      )
    },
    [type],
  )

  return (
    <FormControl
      className={styles.formControl}
      variant="outlined"
      margin="none"
    >
      <RadioGroup
        row
        aria-label="position"
        name="position"
        value={type}
        onChange={callback}
      >
        <FormControlLabel
          control={<Radio size="small" color="primary" />}
          label="Calls"
          value="calls"
        />
        <FormControlLabel
          control={<Radio size="small" color="primary" />}
          label="Puts"
          value="puts"
        />
      </RadioGroup>
    </FormControl>
  )
}

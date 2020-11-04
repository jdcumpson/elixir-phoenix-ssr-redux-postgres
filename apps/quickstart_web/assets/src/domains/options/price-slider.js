import _ from 'lodash'
import React, {useCallback} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {makeStyles} from '@material-ui/core/styles'
import Slider from '@material-ui/core/Slider'
import Typography from '@material-ui/core/Typography'

import {updateOptionQuery} from 'domains/options/actions'

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(2),
  },
}))

function valueText(value) {
  console.info(value)
  return `$${value}`
}

const dispatchAction = _.debounce((dispatch, newValue) => {
  dispatch(
    updateOptionQuery({
      minStrikePrice: newValue[0],
      maxStrikePrice: newValue[1],
    }),
  )
}, 100)

export default function PriceSlider(props) {
  const styles = useStyles()
  const dispatch = useDispatch()
  const strikePrice = useSelector(
    (state) => state.options.companies.currentSelection.strikePrice,
  )
  const {maxStrikePrice, minStrikePrice} = useSelector(
    (state) => state.options.option.args,
  )

  const [val, setVal] = React.useState([0, 100])

  const callback = useCallback((_event, newValue) => {
    dispatchAction(dispatch, newValue)
    setVal(newValue)
  })

  React.useEffect(() => {
    if (val[0] == 0 && val[1] == 100) {
      setVal([
        minStrikePrice || strikePrice * 0.85,
        maxStrikePrice || strikePrice * 1.15,
      ])
      console.info(val)
    }
  }, [minStrikePrice, maxStrikePrice])

  if (!strikePrice) {
    return null
  }

  return (
    <div className={styles.root}>
      {strikePrice && (
        <Slider
          onChange={callback}
          value={val}
          valueLabelDisplay="auto"
          aria-labelledby="range-slider"
          getAriaValueText={valueText}
          max={10 * strikePrice || 100}
          min={0}
        />
      )}
    </div>
  )
}

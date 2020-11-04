import React from 'react'
import cx from 'classnames'
import {useSelector} from 'react-redux'
import {makeStyles} from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import {format, parse} from 'date-fns'

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

const optionToRgb = (option, maxRisk) => {
  if (option.profit == 0) {
    return null
  }

  const color1 = option.profit > 0 ? deepGreen : lightRed
  const color2 = option.profit > 0 ? lightGreen : deepRed

  let percent = 0
  if (option.profit > 0) {
    percent = 1 - option.profit / maxRisk
  } else {
    // percent = 1 - -1 * (option.cost / option.profit)
    percent = option.profit / -maxRisk
  }

  return rgbify(convolve(color1, color2, percent))
}

const useStyles = makeStyles((theme) => ({
  paper: {
    maxWidth: '100%',
  },
  cell: {
    height: 50,
    padding: theme.spacing(2),
    textAlign: 'center',
  },
  cellMonth: {
    '&:nth-child(even)': {
      background: '#f3f3f3',
    },
  },
  tableRoot: {},
  leftTitle: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  tbody: {},
  tableWrapper: {
    maxWidth: '100%',
    overflow: 'scroll',
    position: 'relative',
    padding: theme.spacing(1),
  },
}))

export default function Predictions(props) {
  const styles = useStyles()
  const {predictions, option} = useSelector((state) => state.options.option)
  const {symbol, date, strikePrice, type} = useSelector(
    (state) => state.options.option.args,
  )

  if (!predictions.data.length || !option) {
    return null
  }

  return (
    <Paper classes={{root: styles.paper}}>
      <div className={styles.tableWrapper}>
        <table className={styles.tableRoot}>
          <thead>
            <tr>
              <th className={cx(styles.cell, styles.cellMonth)}></th>
              {_.chain(predictions.data[0])
                .groupBy((prediction) => {
                  return format(
                    parse(prediction.date, 'yyyy-MM-dd', new Date()),
                    'yyyy-MM',
                  )
                })
                .toPairs()
                .map(([date, predictions]) => (
                  <th
                    key={date}
                    className={cx(styles.cell, styles.cellMonth)}
                    colSpan={predictions.length}
                  >
                    <div>
                      {format(parse(date, 'yyyy-MM', new Date()), 'MMM')}
                    </div>
                  </th>
                ))
                .value()}
            </tr>
            <tr>
              <th className={styles.cell}></th>
              {predictions.data[0].map((prediction) => (
                <th key={prediction.date} className={styles.cell}>
                  <div>
                    {format(
                      parse(prediction.date, 'yyyy-MM-dd', new Date()),
                      'd',
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {predictions.data.map((row, n) => (
              <tr key={n}>
                <th className={cx(styles.cell, styles.leftTitle)}>
                  {row[0].strikePrice.toFixed(2)}
                </th>
                {row.map((prediction) => (
                  <td
                    className={styles.cell}
                    style={{
                      backgroundColor: optionToRgb(
                        prediction,
                        prediction.profit > 0
                          ? predictions.maxProfit
                          : option.price * 100,
                      ),
                    }}
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
      </div>
    </Paper>
  )
}

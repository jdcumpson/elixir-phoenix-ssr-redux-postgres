import React, {Suspense} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {makeStyles} from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Toolbar from '@material-ui/core/Toolbar'
import Grid from '@material-ui/core/Grid'
import _ from 'lodash'
import Skeleton from '@material-ui/lab/Skeleton'
import Accordion from '@material-ui/core/Accordion'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import Predictions from 'domains/options/predictions'
import CustomPrice from 'domains/options/custom-price'
import DateSelector from 'domains/options/date-selector'
import OptionSelector from 'domains/options/option-selector'
import OptionType from 'domains/options/option-type'
import SymbolSelector from 'domains/options/symbol-selector'
import MinMaxPrice from 'domains/options/min-max-price'

import {
  fetchAllCompanies,
  fetchOptions,
  fetchPredictions,
} from 'domains/options/actions'
import {updateOptionQuery} from 'domains/options/actions'

const useStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.up('md')]: {
      margin: theme.spacing(4),
    },
  },
  toolbar: {
    flexGrow: 1,
  },
  secondHalf: {
    marginTop: theme.spacing(2),
  },
  paper: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2),
  },
  paperWrapper: {
    padding: theme.spacing(1),
  },
  accordion: {
    paddingTop: theme.spacing(2),
  },
  optionInfo: {
    marginTop: theme.spacing(2),
  },
}))

const Chart = React.lazy(() =>
  import(/* webpackPreload: true */ '../components/line-chart'),
)

export default function Option(props) {
  const styles = useStyles()
  const dispatch = useDispatch()
  const {option} = useSelector((state) => state.options.option)
  const options = useSelector((state) => state.options.options.currentSelection)
  const optionsBySymbol = useSelector((state) => state.options.options.bySymbol)
  const fetching = useSelector((state) => state.options.option.fetching)
  const {
    symbol,
    date,
    type,
    customPrice,
    maxStrikePrice,
    minStrikePrice,
  } = useSelector((state) => state.options.option.args)
  const companyData = useSelector(
    (state) => state.options.companies.currentSelection,
  )

  const optionStrikePrice = _.get(option, ['strikePrice'], undefined)

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
      options.length == 0 &&
      symbol
    ) {
      dispatch(updateOptionQuery({symbol}))
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
        optionStrikePrice || undefined,
        minStrikePrice || undefined,
        maxStrikePrice || undefined,
        customPrice,
        undefined,
        type,
      ),
    )
  }, [
    symbol,
    date,
    optionStrikePrice,
    type,
    customPrice,
    minStrikePrice,
    maxStrikePrice,
  ])

  return (
    <div className={styles.root}>
      <div className={styles.paperWrapper}>
        <Paper classes={{root: styles.paper}}>
          <Toolbar>
            <div className={styles.toolbar}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <SymbolSelector />
                  <DateSelector />
                  <OptionSelector />
                  <OptionType />
                  {option && option.price && (
                    <div className={styles.optionInfo}>
                      {!fetching ? (
                        <>
                          <Typography>
                            Option premium ${option && option.price}
                          </Typography>
                          <Typography>
                            Implied volatility{' '}
                            {_.get(option, 'impliedVolatility')}
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Skeleton variant="text" />
                          <Skeleton variant="text" />
                        </>
                      )}
                    </div>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  {companyData && companyData.strikePrice && (
                    <>
                      {!fetching ? (
                        <>
                          <Typography gutterBottom variant="h6">
                            {companyData.symbol} - ${companyData.strikePrice}
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Skeleton height={32} variant="text" />
                        </>
                      )}
                    </>
                  )}
                  {companyData && companyData.tochlv && (
                    <>
                      <Suspense fallback={null}>
                        <Chart
                          data={companyData.tochlv.map((x) => [
                            new Date(x.t * 1000),
                            x.h,
                          ])}
                          curve
                          min={Math.min(...companyData.tochlv.map((x) => x.h))}
                          max={Math.max(...companyData.tochlv.map((x) => x.h))}
                        />
                      </Suspense>
                    </>
                  )}
                </Grid>
              </Grid>
            </div>
          </Toolbar>
        </Paper>
      </div>
      <div className={styles.paperWrapper}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography className={styles.heading}>Advanced</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container justify="flex-start" direction="column">
              <Grid item xs={12} md={2}>
                <MinMaxPrice />
              </Grid>
              <Grid item xs={12} md={4}>
                <CustomPrice />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </div>
      <div className={styles.secondHalf}>
        <Predictions />
      </div>
    </div>
  )
}

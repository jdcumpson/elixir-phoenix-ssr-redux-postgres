import _ from 'lodash'
import React from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {useTheme, makeStyles} from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import ListSubheader from '@material-ui/core/ListSubheader'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Toolbar from '@material-ui/core/Toolbar'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import FormControl from '@material-ui/core/FormControl'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import {VariableSizeList} from 'react-window'
import matchSorter from 'match-sorter'

import {ButtonLink} from 'components/link'
import {navigateTo} from 'domains/page/actions'
import {fetchAllCompanies, fetchOptions} from 'domains/options/actions'

const LISTBOX_PADDING = 8 // px

function renderRow(props) {
  const {data, index, style} = props
  return React.cloneElement(data[index], {
    style: {
      ...style,
      top: style.top + LISTBOX_PADDING,
    },
  })
}

const OuterElementContext = React.createContext({})

const OuterElementType = React.forwardRef((props, ref) => {
  const outerProps = React.useContext(OuterElementContext)
  return <div ref={ref} {...props} {...outerProps} />
})

function useResetCache(data) {
  const ref = React.useRef(null)
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true)
    }
  }, [data])
  return ref
}

// Adapter for react-window
export const ListboxComponent = React.forwardRef(function ListboxComponent(
  props,
  ref,
) {
  const {children, ...other} = props
  const itemData = React.Children.toArray(children)
  const theme = useTheme()
  const smUp = useMediaQuery(theme.breakpoints.up('sm'), {noSsr: true})
  const itemCount = itemData.length
  const itemSize = 64

  const getChildSize = (child) => {
    return (
      Math.ceil(child.props.children.props.children.join('').length / 30) * 24 +
      20
    )
  }

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0)
  }

  const gridRef = useResetCache(itemCount)

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={(index) => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  )
})

const useStyles = makeStyles((theme) => ({
  body: {
    padding: theme.spacing(4),
  },
  option: {
    width: 300,
    marginTop: theme.spacing(2),
  },
  formControl: {
    marginTop: theme.spacing(2),
    width: 300,
  },
}))

export default React.forwardRef((props, ref) => {
  const dispatch = useDispatch()
  const optionsBySymbol = useSelector((state) => state.options.options.bySymbol)
  const symbol = useSelector((state) => state.page.params.symbol.toUpperCase())
  const type = useSelector((state) => state.page.params.type) || 'calls'
  const date = useSelector((state) => state.page.params.date)
  const companies = useSelector((state) => state.options.companies.data)
  const expirations =
    type === 'calls'
      ? _.get(optionsBySymbol, [symbol, 'callExpirations'], [])
      : _.get(optionsBySymbol, [symbol, 'putExpirations'], [])
  const inverseType = type === 'calls' ? 'puts' : 'calls'
  const options = _.chain(optionsBySymbol)
    .get(`${symbol}.${type}`, [])
    .filter((option) => option.expiry === date)
    .value()
  const styles = useStyles()

  React.useEffect(() => {
    dispatch(fetchAllCompanies())
  }, [])

  React.useEffect(() => {
    dispatch(fetchOptions(symbol))
  }, symbol)

  const filterOptions = (companies, {inputValue}) =>
    matchSorter(companies, inputValue, {
      keys: ['symbol', 'name'],
    })

  return (
    <div className={styles.body}>
      <Paper>
        <Toolbar>
          <div>
            <Autocomplete
              id="symbol-selector"
              filterOptions={filterOptions}
              options={companies}
              classes={{
                root: styles.option,
              }}
              ListboxComponent={ListboxComponent}
              onChange={(event, company) => {
                if (!company) {
                  return
                }
                dispatch(navigateTo(`/${company.symbol}/options/${type}`))
              }}
              value={
                _.find(
                  companies,
                  (company) =>
                    company.symbol.toUpperCase() === symbol.toUpperCase(),
                ) || {symbol: symbol, name: ''}
              }
              autoHighlight
              getOptionLabel={(company) =>
                `${company.symbol} - ${company.name}`
              }
              renderOption={(option) => (
                <React.Fragment>
                  {option.symbol} - {option.name}
                </React.Fragment>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Choose company"
                  variant="outlined"
                  inputProps={{
                    ...params.inputProps,
                    autoComplete: 'new-password', // disable autocomplete and autofill
                  }}
                />
              )}
            />
            <Autocomplete
              id="date-selector"
              options={expirations}
              classes={{
                root: styles.option,
              }}
              onChange={(event, option) => {
                if (!option) {
                  return
                }
                dispatch(
                  navigateTo(`/${symbol}/options/${type}/${option.value}`, {
                    keepQueryParams: true,
                  }),
                )
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
            <FormControl className={styles.formControl} variant="outlined">
              <InputLabel>Option type</InputLabel>
              <Select
                label="Option type"
                value={type}
                onChange={(event) => {
                  dispatch(
                    navigateTo(
                      `/${symbol}/options/${event.target.value}/${
                        date ? date : ''
                      }`,
                      {
                        keepQueryParams: true,
                      },
                    ),
                  )
                }}
              >
                <MenuItem value="calls">Call</MenuItem>
                <MenuItem value="puts">Put</MenuItem>
              </Select>
            </FormControl>
          </div>
        </Toolbar>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Strike price</TableCell>
                <TableCell>Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {options.map((option) => (
                <TableRow key={option.expiry + option.strikePrice}>
                  <TableCell component="th" scope="row">
                    ${option.strikePrice.toFixed(2)}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    ${option.price.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  )
})

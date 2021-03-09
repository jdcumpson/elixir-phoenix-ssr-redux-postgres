import {createMuiTheme} from '@material-ui/core'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#6520ff',
    },
    secondary: {
      main: '#1de9b6',
    },
    text: {
      primary: '#362d59',
    },
  },
  overrides: {
    MuiButton: {
      root: {},
      containedSecondary: {
        color: 'black',
      },
      // contained: {
      //   borderRadius: 24,
      //   fontSize: '0.78rem',
      // },
      // containedSizeLarge: {
      //   fontSize: '0.78rem',
      // },
      // containedSizeSmall: {
      //   fontSize: '0.78rem',
      // },
    },
  },
})

export default theme

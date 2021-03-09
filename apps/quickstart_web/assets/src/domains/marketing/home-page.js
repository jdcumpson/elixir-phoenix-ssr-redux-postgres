import * as React from 'react'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

export default function HomePage(props) {
  return (
    <div>
      <Typography>Marketing home page</Typography>
      <Button
        color="primary"
        variant="contained"
        target="_blank"
        href={'https://material-ui.com'}
      >
        Material UI
      </Button>
    </div>
  )
}

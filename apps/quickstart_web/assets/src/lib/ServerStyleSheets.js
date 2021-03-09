import React from 'react'
import {SheetsRegistry} from 'jss'
import {StylesProvider, createGenerateClassName} from '@material-ui/core/styles'

export default class ServerStyleSheets {
  constructor(options = {}) {
    this.options = options
  }

  collect(children) {
    // This is needed in order to deduplicate the injection of CSS in the page.
    const sheetsManager = new Map()
    // This is needed in order to inject the critical CSS.
    this.sheetsRegistry = new SheetsRegistry()
    // A new class name generator
    const generateClassName = createGenerateClassName({
      seed: this.options.name,
      productionPrefix: this.options.name,
      disableGlobal: true,
    })

    return (
      <StylesProvider
        sheetsManager={sheetsManager}
        serverGenerateClassName={generateClassName}
        generateClassName={generateClassName}
        sheetsRegistry={this.sheetsRegistry}
        {...this.options}
      >
        {children}
      </StylesProvider>
    )
  }

  toString() {
    return this.sheetsRegistry ? this.sheetsRegistry.toString() : ''
  }

  getStyleElement(props) {
    return React.createElement('style', {
      id: 'jss-server-side',
      key: 'jss-server-side',
      dangerouslySetInnerHTML: {__html: this.toString()},
      ...props,
    })
  }
}

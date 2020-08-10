import _ from 'lodash'
import classnames from 'classnames'
import React from 'react'
import {withStyles} from '@material-ui/core/styles'
import {connect} from 'react-redux'

import {navigateTo} from 'domains/page/actions'

class _Link extends React.PureComponent {
  static defaultProps = {
    element: 'a',
    flex: false,
    noHistory: false,
    inherit: false,
    target: undefined,
    block: false,
  }

  handleClick = (event) => {
    const {
      to,
      external,
      noHistory,
      navigateTo,
      navigateToOptions = {},
    } = this.props
    if (external) {
      return
    }

    if (!external) {
      event.preventDefault()
    }
    const onClick = _.get(this.props, 'onClick', _.noop)

    try {
      onClick(event)
    } catch (error) {
      console.error('Link onClick failed', error)
    }

    if (external) {
      return
    }
    if (noHistory) {
      return
    }
    navigateTo(to, navigateToOptions)
  }

  render() {
    const {
      element: Element,
      classes,
      className,
      children,
      to,
      flex,
      inherit,
      target,
      block,
      ...props
    } = this.props

    const filteredProps = _.pick(props, [
      'onBlur',
      'onClick',
      'onFocus',
      'onHover',
      'onKeyDown',
      'onKeyUp',
      'onKeyUp',
      'onMouseUp',
      'onMouseDown',
      'onMouseLeavre',
      'onDragLeave',
      'onTouchEnd',
      'onTouchStart',
      'onTouchMove',
      'tabIndex',
      'role',
      'aria-disabled',
    ])

    return (
      <Element
        target={target}
        href={to}
        {...filteredProps}
        target={props.external ? '_blank' : null}
        onClick={this.handleClick}
        className={classnames(classes.root, className, {
          [classes.block]: !!block,
          [classes.flex]: !!flex,
          [classes.inherit]: !!inherit,
        })}
      >
        {children}
      </Element>
    )
  }
}

export const Link = connect(
  (state) => state.page,
  (dispatch, ownProps) => ({
    navigateTo: (...args) => dispatch(navigateTo(...args)),
  }),
)(
  withStyles({
    root: {
      cursor: 'pointer',
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'none',
      },
    },
    flex: {
      display: 'flex',
    },
    inherit: {
      color: 'inherit',
    },
    block: {
      display: 'block',
    },
  })(_Link),
)

export const ButtonLink = React.forwardRef((props, ref) => (
  <Link to={props.to} {...props} ref={ref} />
))

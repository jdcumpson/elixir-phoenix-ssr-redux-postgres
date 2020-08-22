import _ from 'lodash'
import classnames from 'classnames'
import React from 'react'
import {makeStyles} from '@material-ui/core/styles'
import {useDispatch, useSelector} from 'react-redux'

import {navigateTo} from 'domains/page/actions'

const useStyle = makeStyles((theme) => ({
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
}))

export const Link = React.forwardRef((props, ref) => {
  const {
    element: Element = 'a',
    className,
    children,
    to,
    flex,
    inherit,
    target,
    block,
  } = props
  const classes = useStyle()
  const dispatch = useDispatch()

  const handleClick = (event) => {
    const {to, external, noHistory, navigateToOptions = {}} = props

    if (external) {
      return
    }

    if (!external) {
      event.preventDefault()
    }
    const onClick = _.get(props, 'onClick', _.noop)

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
    dispatch(navigateTo(to, navigateToOptions))
  }

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
      ref={ref}
      target={props.external ? '_blank' : null}
      onClick={handleClick}
      className={classnames(classes.root, className, {
        [classes.block]: !!block,
        [classes.flex]: !!flex,
        [classes.inherit]: !!inherit,
      })}
    >
      {children}
    </Element>
  )
})

export const ButtonLink = React.forwardRef((props, ref) => (
  <Link to={props.to} {...props} ref={ref} />
))

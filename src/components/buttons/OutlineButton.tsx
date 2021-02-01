import React from 'react'
import { buttonIcons, buttonSizes } from './theme'
import ReactLoading from 'react-loading'
import { ButtonProps } from './Button'

import { cn } from '../../utils/format'

const OutlineButton = (props: ButtonProps) => {
  let {
    children,
    disabled = false,
    color = 'primary',
    type = 'button',
    loading = false,
    icon,
    block,
    size = 'medium',
    ...rest
  } = props

  if (loading) disabled = true

  const styles = {
    button: {
      default: [
        'button-outline',
        color,
        size ? buttonSizes[size] : buttonSizes['medium'],
        block ? 'w-full block' : 'w-auto',
      ],
    },
  }

  return (
    <button className={cn(styles.button)} disabled={disabled} type={type} {...rest}>
      {icon && !loading && <span className="mr-1">{buttonIcons[icon]}</span>}
      {loading ? (
        <ReactLoading width={24} height={24} type="bubbles" className="mx-auto" />
      ) : (
        children
      )}
    </button>
  )
}

export default OutlineButton

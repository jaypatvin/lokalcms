import React, { ReactNode } from 'react'
import { buttonIcons, buttonSizes } from './theme'
import ReactLoading from 'react-loading'

import { cn } from '../../utils/format'
import { ButtonIcon, Color, Size } from '../../utils/types'

export type ButtonProps = {
  children?: ReactNode
  disabled?: boolean
  color?: Color
  type?: 'button' | 'submit'
  loading?: boolean
  icon?: ButtonIcon
  block?: boolean
  size?: Size
  className?: string
  [x: string]: any
}

const Button = (props: ButtonProps) => {
  let {
    children,
    disabled = false,
    color = 'primary',
    type = 'button',
    loading = false,
    icon,
    block,
    size = 'medium',
    className = '',
    ...rest
  } = props

  if (loading) disabled = true

  const styles = {
    button: {
      default: [
        'button',
        size ? buttonSizes[size] : buttonSizes['medium'],
        color,
        block ? 'w-full block' : 'w-auto',
      ],
    },
  }

  return (
    <button
      className={`${className} ${cn(styles.button)}`}
      disabled={disabled}
      type={type}
      {...rest}
    >
      {icon && !loading && <span className="mr-1">{buttonIcons[icon]}</span>}
      {loading ? (
        <ReactLoading width={24} height={24} type="bubbles" className="mx-auto" />
      ) : (
        children
      )}
    </button>
  )
}

export default Button

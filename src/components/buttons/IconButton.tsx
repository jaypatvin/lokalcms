import React from 'react'
import { buttonIcons } from './theme'
import ReactLoading from 'react-loading'
import { ButtonProps } from './Button'

import { cn } from '../../utils/format'

const sizeProps = {
  small: 'py-1 px-1 ',
  medium: 'py-2 px-2',
  large: 'py-3 px-3',
}

type Props = ButtonProps & {
  outline?: boolean
}

const IconButton = (props: Props) => {
  let {
    children,
    disabled = false,
    color = 'primary',
    type = 'button',
    loading = false,
    icon,
    block,
    outline = false,
    size = 'medium',
    ...rest
  } = props

  if (loading) disabled = true

  const styles = {
    button: {
      default: [
        'button-icon',
        color,
        outline ? 'with-outline' : '',
        size ? sizeProps[size] : sizeProps['medium'],
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

export default IconButton

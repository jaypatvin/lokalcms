import React from 'react'
import { buttonColors, buttonIcons, buttonSizes } from './theme'
import ReactLoading from 'react-loading'

import { cn } from '../../utils/format'

const Button = (props) => {
  let {
    children,
    disabled=false,
    color='primary',
    type='button',
    loading=false,
    icon,
    block,
    size='normal',
    ...rest
  } = props

  if (loading) disabled = true
  
  const styles = {
    button: {
      default: [
        'button',
        size ? buttonSizes[size] : buttonSizes['normal'], 
        color,
        block ? 'w-full block' : 'w-auto'
      ]
    }
  }

  return(<button className={cn(styles.button)} disabled={disabled} type={type} {...rest}>
    {icon && !loading && <span className='mr-1'>{buttonIcons[icon]}</span>}
    { loading ? <ReactLoading width={24} height={24} type='bubbles' className='mx-auto'/>  : children }
  </button>)
}

export default Button
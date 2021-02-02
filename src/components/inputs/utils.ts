import { Size } from '../../utils/types'

export type InputProps = {
  label: string
  error: string
  touched: boolean
  initialValue?: boolean
  initialTouched?: boolean
  initialError?: string
  noMargin?: boolean
  placeholder?: string
  size?: Size
}

export const sizes = {
  small: {
    label: 'text-sm',
    input: 'py-1 px-3',
  },
  medium: {
    label: 'text-base',
    input: 'py-2 px-4',
  },
  large: {
    label: 'text-lg',
    input: 'py-3 px-5',
  },
}

export type SelectType = {
  id: number
  name: string
  [x: string]: any
}

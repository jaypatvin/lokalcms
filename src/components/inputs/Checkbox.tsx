import React from 'react'
import { useField } from 'formik'
import { cn } from '../../utils/format'
import { InputProps, sizes } from './utils'

type Props = InputProps & { value?: boolean }

const Checkbox = React.forwardRef<HTMLInputElement, Props>((props, ref) => {
  const {
    label,
    errorMessage,
    isError,
    initialValue,
    initialTouched,
    initialError,
    noMargin,
    placeholder,
    size = 'medium',
    value,
    className = '',
    ...rest
  } = props

  const styles = {
    wrapper: {
      default: ['flex', 'items-center', noMargin ? 'mb-0' : 'mb-4'],
    },
    label: {
      default: ['text-gray-600', 'mb-1', size ? sizes[size].label : sizes['medium'].label],
    },
    input: {
      default: [
        'border-2',
        'border-gray-300',
        'rounded',
        'placeholder-gray-500',
        'text-gray-600',
        'mr-2',
        size ? sizes[size].input : sizes['medium'].input,
        isError && errorMessage ? 'border-red-300' : 'border-gray-300',
      ],
      focus: ['border-blue-300'],
    },
    errorMessage: {
      default: ['block', 'mt-1', 'text-sm', 'text-red-500'],
    },
  }

  return (
    <div className={className}>
      <div className={cn(styles.wrapper)}>
        <input ref={ref} className={cn(styles.input)} checked={value} type="checkbox" {...rest} />
        {label && <label className={cn(styles.label)}>{label}</label>}
        {isError && errorMessage && <span className={cn(styles.errorMessage)}>{errorMessage}</span>}
      </div>
    </div>
  )
})

const FormikCheckbox = ({ label, ...rest }: any) => {
  const [field, meta] = useField(rest)

  return <Checkbox label={label} {...field} {...meta} {...rest} />
}

export { Checkbox, FormikCheckbox }

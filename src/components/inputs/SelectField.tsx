import React from 'react'
import { useField } from 'formik'
import { cn } from '../../utils/format'
import { InputProps, SelectType, sizes } from './utils'

type Props = InputProps & {
  options: SelectType[]
  optionKeyRef: string
  optionValueRef: string
  optionPlaceholderRef: string
  [x: string]: any
}

const SelectField = React.forwardRef<HTMLSelectElement, Props>((props, ref) => {
  const {
    label,
    options,
    error,
    touched,
    initialValue,
    initialTouched,
    initialError,
    noMargin,
    placeholder,
    optionKeyRef,
    optionValueRef,
    optionPlaceholderRef,
    size = 'medium',
    ...rest
  } = props

  const styles = {
    wrapper: {
      default: ['w-full', label && 'flex flex-col', noMargin ? 'mb-0' : 'mb-4'],
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
        'w-full',
        size ? sizes[size].input : sizes['medium'].input,
        touched && error ? 'border-red-300' : 'border-gray-300',
      ],
      focus: ['border-blue-300'],
    },
    errorMessage: {
      default: ['block', 'mt-1', 'text-sm', 'text-red-500'],
    },
  }

  return (
    <div className={cn(styles.wrapper)}>
      {label && <label className={cn(styles.label)}>{label}</label>}
      <select ref={ref} className={cn(styles.input)} {...rest}>
        <option value="" hidden>
          {options.length === 0 ? 'Load options...' : placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option[optionKeyRef] || option.id}
            value={option[optionValueRef] || option.id}
          >
            {option[optionPlaceholderRef] || option.name}
          </option>
        ))}
      </select>
      {touched && error && <span className={cn(styles.errorMessage)}>{error}</span>}
    </div>
  )
})

const FormikSelectField = ({ ...rest }: any) => {
  const [field, meta] = useField(rest)

  return <SelectField label={rest.label} {...field} {...meta} {...rest} />
}

export { SelectField, FormikSelectField }

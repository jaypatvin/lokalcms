import React, { ChangeEventHandler } from 'react'
import { useField } from 'formik'
import { cn } from '../../utils/format'
import { sizes, InputProps } from './utils'

type Props = Omit<InputProps, 'onChange'> & {
  defaultValue?: string
  readOnly?: boolean
  value?: string
  maxLength?: number
  onChange?: ChangeEventHandler<HTMLTextAreaElement>
}

const TextAreaField = React.forwardRef<HTMLTextAreaElement, Props>((props, ref) => {
  const {
    label,
    isError,
    errorMessage,
    touched,
    initialTouched,
    initialError,
    noMargin,
    size = 'medium',
    required,
    readOnly = false,
    value,
    ...rest
  } = props

  const styles = {
    wrapper: {
      default: ['w-full', label ? 'flex flex-col' : '', noMargin ? 'mb-0' : 'mb-4'],
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
        'resize-none',
        size ? sizes[size].input : sizes['medium'].input,
        isError ? 'border-red-300' : 'border-gray-300',
        readOnly ? 'bg-gray-200' : '',
      ],
      focus: ['border-blue-300'],
    },
    errorMessage: {
      default: ['block', 'mt-1', 'text-sm', 'text-red-500'],
    },
  }

  return (
    <div className={cn(styles.wrapper)}>
      {label && (
        <label className={cn(styles.label)}>
          {label} {required ? <span className="text-red-600">*</span> : ''}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(styles.input)}
        readOnly={readOnly}
        {...rest}
        value={value}
      ></textarea>
      {isError && <span className={cn(styles.errorMessage)}>{errorMessage}</span>}
    </div>
  )
})

const FormikTextAreaField = ({ label, type = 'text', ...rest }: any) => {
  const [field, meta] = useField(rest)

  return <TextAreaField label={label} type={type} {...field} {...meta} {...rest} />
}

export { TextAreaField, FormikTextAreaField }

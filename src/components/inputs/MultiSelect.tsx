import React, { useEffect, useState } from 'react'
import { cloneDeep } from 'lodash'
import { useField } from 'formik'
import { cn } from '../../utils/format'
import { InputProps, sizes } from './utils'
import useOuterClick from '../../customHooks/useOuterClick'

export type MultiSelectOption = { id: string; name: string; checked: boolean }

type Props = InputProps & {
  options: MultiSelectOption[]
  onChange?: (options: MultiSelectOption[]) => void
  [x: string]: any
}

const MultiSelect = React.forwardRef<HTMLSelectElement, Props>((props, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const optionsRef = useOuterClick(() => setIsOpen(false))
  const {
    label,
    options,
    isError,
    errorMessage,
    required,
    noMargin,
    placeholder,
    size = 'medium',
    onChange,
    ...rest
  } = props
  const [defaultOptions, setDefaultOptions] = useState<MultiSelectOption[]>()
  const [stateOptions, setStateOptions] = useState(options)

  useEffect(() => {
    setDefaultOptions(options)
  }, [])

  const checkHandler = (id: string) => {
    const newOptions = cloneDeep(stateOptions)
    const option = newOptions.find((o) => o.id === id)!
    option.checked = !option.checked
    setStateOptions(newOptions)
    if (onChange) {
      onChange(newOptions)
    }
  }

  const onSelectAll = () => {
    const newOptions = cloneDeep(stateOptions)
    for (const option of newOptions) {
      option.checked = true
    }
    setStateOptions(newOptions)
    if (onChange) {
      onChange(newOptions)
    }
  }

  const onReset = () => {
    if (defaultOptions) {
      const newOptions = cloneDeep(defaultOptions)
      setStateOptions(newOptions)
      if (onChange) {
        onChange(newOptions)
      }
    }
  }

  const styles = {
    wrapper: {
      default: ['w-full', 'relative', label ? 'flex flex-col' : ''],
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
        'bg-white',
        size ? sizes[size].input : sizes['medium'].input,
        isError ? 'border-red-300' : 'border-gray-300',
      ],
      focus: ['border-blue-300'],
    },
    errorMessage: {
      default: ['block', 'mt-1', 'text-sm', 'text-red-500'],
    },
  }

  return (
    <div ref={optionsRef} className="w-48 relative">
      <div className={cn(styles.wrapper)} onClick={() => setIsOpen(!isOpen)}>
        {label && (
          <label className={cn(styles.label)}>
            {label} {required ? <span className="text-red-600">*</span> : ''}
          </label>
        )}
        <select ref={ref} className={cn(styles.input)} {...rest}>
          <option value="">{placeholder ?? ''}</option>
        </select>
        <div className="absolute left-0 right-0 top-0 bottom-0"></div>
        {isError && <span className={cn(styles.errorMessage)}>{errorMessage}</span>}
      </div>
      {isOpen ? (
        <div className="border-solid border-1 absolute left-0 top-full w-full bg-white">
          <button
            className="block text-primary-600 px-2 w-full text-left hover:bg-secondary-100"
            type="button"
            onClick={() => onReset()}
          >
            Reset
          </button>
          <button
            className="block text-primary-600 px-2 w-full text-left hover:bg-secondary-100"
            type="button"
            onClick={() => onSelectAll()}
          >
            Select All
          </button>
          {stateOptions.map((option) => (
            <label
              key={option.id}
              htmlFor={option.id}
              className="block px-2 hover:bg-secondary-100"
            >
              <input
                type="checkbox"
                id={option.id}
                className="mr-2"
                checked={option.checked}
                onChange={() => checkHandler(option.id)}
                disabled={
                  defaultOptions && defaultOptions.some((o) => o.id === option.id && o.checked)
                }
              />
              {option.name}
            </label>
          ))}
        </div>
      ) : (
        ''
      )}
    </div>
  )
})

const FormikMultiSelect = ({ ...rest }: any) => {
  const [field, meta] = useField(rest)

  return <MultiSelect label={rest.label} {...field} {...meta} {...rest} />
}

export { MultiSelect, FormikMultiSelect }

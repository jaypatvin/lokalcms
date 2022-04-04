import React, { useState } from 'react'
import { useField } from 'formik'
import { cn } from '../../utils/format'
import { InputProps, sizes } from './utils'
import useOuterClick from '../../customHooks/useOuterClick'

type RadioGroup = {
  title: string
  id: string
  options: { key: string; name: string }[]
}

export type RadioGroups = RadioGroup[]

type StateValue = {
  [x: string]: string
}

type Props = InputProps & {
  options: RadioGroups
  onChange?: (data: StateValue) => void
  [x: string]: any
}

const RadioSelectGroup = React.forwardRef<HTMLSelectElement, Props>((props, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const optionsRef = useOuterClick(() => setIsOpen(false))
  const {
    label,
    options,
    isError,
    errorMessage,
    required,
    touched,
    initialValue,
    initialTouched,
    initialError,
    noMargin,
    placeholder,
    size = 'medium',
    onChange,
    ...rest
  } = props
  const [stateOptions, setStateOptions] = useState<StateValue>({})

  const checkHandler = (id: string, key: string) => {
    const newState = { ...stateOptions, [id]: key }
    setStateOptions(newState)
    if (onChange) onChange(newState)
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
          {options.map((option) => (
            <div key={option.id} className="p-2">
              <p>{option.title}</p>
              {option.options.map((subOption) => (
                <label key={subOption.key} htmlFor={subOption.key} className="block px-2">
                  <input
                    type="radio"
                    id={subOption.key}
                    name={option.id}
                    className="mr-2"
                    onChange={() => checkHandler(option.id, subOption.key)}
                  />
                  {subOption.name}
                </label>
              ))}
            </div>
          ))}
        </div>
      ) : (
        ''
      )}
    </div>
  )
})

const FormikRadioSelectGroup = ({ ...rest }: any) => {
  const [field, meta] = useField(rest)

  return <RadioSelectGroup label={rest.label} {...field} {...meta} {...rest} />
}

export { RadioSelectGroup, FormikRadioSelectGroup }

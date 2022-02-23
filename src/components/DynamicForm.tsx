import React, { useState, useEffect } from 'react'
import { isEmpty, cloneDeep } from 'lodash'
import { TextField } from './inputs'
import { Button } from './buttons'

export type Field = {
  type:
    | 'text'
    | 'email'
    | 'textarea'
    | 'dropdown'
    | 'checkbox'
    | 'number'
    | 'date'
    | 'time'
    | 'schedule'
    | 'image'
    | 'gallery'
  key: string
  label: string
  defaultValue?: unknown
  required?: boolean
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  enum?: string[]
  pattern?: RegExp
  format?: ''
  customizable?: boolean
}

type ResponseError = {
  [x: string]: string
}

type FormData = {
  [x: string]: unknown
}

type Props = {
  fields: Field[]
  responseErrors?: ResponseError
  errorMessage?: string
  onSave?: (data: FormData) => void
  onCancel?: () => void
  className?: string
  formClassName?: string
  saveLabel?: string
  cancelLabel?: string
}

const DynamicForm = ({
  fields,
  responseErrors,
  errorMessage,
  onSave,
  onCancel,
  className = '',
  formClassName = '',
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
}: Props) => {
  const [formData, setFormData] = useState<FormData>({})

  useEffect(() => {
    const initialFormData = fields.reduce<FormData>((acc, field) => {
      if (field.defaultValue) {
        acc[field.key] = field.defaultValue
      }
      return acc
    }, {})

    setFormData(initialFormData)
  }, [])

  const changeHandler = (field: Field, value: unknown) => {
    const newFormData = cloneDeep(formData)
    newFormData[field.key] = value
    setFormData(newFormData)
  }

  const renderField = (field: Field) => {
    const isError = !isEmpty(responseErrors) && !!responseErrors![field.key]
    const message = isError ? responseErrors![field.key] : undefined
    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <TextField
            required={field.required}
            label={field.label}
            type={field.type}
            size="small"
            onChange={(e) => changeHandler(field, e.target.value)}
            isError={isError}
            errorMessage={message}
            defaultValue={field.defaultValue as string}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className={className}>
      <div className={formClassName}>{fields.map(renderField)}</div>
      {errorMessage ? <p className="text-red-600 text-center">{errorMessage}</p> : null}
      <div className="flex justify-end">
        <Button color="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button
          color="primary"
          className="ml-3"
          onClick={onSave ? () => onSave(formData) : undefined}
        >
          {saveLabel}
        </Button>
      </div>
    </div>
  )
}

export default DynamicForm

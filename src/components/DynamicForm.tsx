import React, { useState, useEffect, ChangeEventHandler } from 'react'
import { isEmpty, cloneDeep } from 'lodash'
import { TextField } from './inputs'
import { Button } from './buttons'
import { Community } from '../models'
import useOuterClick from '../customHooks/useOuterClick'
import { useCommunities } from './BasePage'

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
    | 'community'
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

  const [communitySearchText, setCommunitySearchText] = useState('')
  const [communitySearchResult, setCommunitySearchResult] = useState<
    (Community & { id: string })[]
  >([])
  const [showCommunitySearchResult, setShowCommunitySearchResult] = useState(false)
  const communitySearchResultRef = useOuterClick(() => setShowCommunitySearchResult(false))

  const communities = useCommunities()

  useEffect(() => {
    const initialFormData = fields.reduce<FormData>((acc, field) => {
      if (field.defaultValue) {
        acc[field.key] = field.defaultValue
      }
      return acc
    }, {})

    setFormData(initialFormData)
    setCommunitySearchResult(communities)
  }, [])

  const communitySelectHandler = (community: Community & { id: string }) => {
    const newData = { ...formData, community_id: community.id }
    setShowCommunitySearchResult(false)
    setFormData(newData)
    setCommunitySearchText(community.name)
  }

  const communitySearchHandler = (value: string) => {
    setCommunitySearchText(value)
    const filteredCommunities = communities.filter(({ name }) =>
      name.toLowerCase().includes(value.toLowerCase())
    )
    setCommunitySearchResult(filteredCommunities)
    setShowCommunitySearchResult(filteredCommunities.length > 0)
  }

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
            noMargin
          />
        )
      case 'community':
        return (
          <div ref={communitySearchResultRef} className="relative">
            <TextField
              required={field.required}
              label={field.label}
              type="text"
              size="small"
              placeholder="Search"
              onChange={(e) => communitySearchHandler(e.target.value)}
              value={communitySearchText}
              onFocus={() => communitySearchHandler(communitySearchText)}
              noMargin
            />
            {showCommunitySearchResult && communitySearchResult.length > 0 && (
              <div className="absolute top-full left-0 w-64 bg-white shadow z-10">
                {communitySearchResult.map((community) => (
                  <button
                    className="w-full p-1 hover:bg-gray-200 block text-left"
                    key={community.id}
                    onClick={() => communitySelectHandler(community)}
                  >
                    {community.name}
                    <span className="block text-xs text-gray-500">
                      {community.address.subdivision}, {community.address.barangay},{' '}
                      {community.address.city}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
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

import React, { useState, useEffect } from 'react'
import { isEmpty, cloneDeep } from 'lodash'
import { Formik, FormikProps } from 'formik'
import { object, string } from 'yup'
import { FormikTextField } from './inputs'
import { Button } from './buttons'
import { Community } from '../models'
import useOuterClick from '../customHooks/useOuterClick'
import { useCommunities } from './BasePage'
import { useAuth } from '../contexts/AuthContext'
import { API_URL } from '../config/variables'

type Response = {
  status: 'ok' | 'error'
  data?: unknown
  message?: string
  error_fields?: {
    [x: string]: string
  }
}

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

type FormData = {
  [x: string]: unknown
}

type Props = {
  fields: Field[]
  onSuccess?: (res?: Response) => void
  onError?: (res?: Response) => void
  onCancel?: () => void
  className?: string
  formClassName?: string
  saveLabel?: string
  cancelLabel?: string
  method: 'POST' | 'PUT' | 'DELETE'
  url: string
}

const DynamicForm = ({
  fields,
  onSuccess,
  onError,
  onCancel,
  className = '',
  formClassName = '',
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  method,
  url,
}: Props) => {
  const { firebaseToken } = useAuth()
  const [formData, setFormData] = useState<FormData>({})
  const [response, setResponse] = useState<Response>()
  const [validationSchema, setValidationSchema] = useState<any>()

  const [communitySearchText, setCommunitySearchText] = useState('')
  const [communitySearchResult, setCommunitySearchResult] = useState<
    (Community & { id: string })[]
  >([])
  const [showCommunitySearchResult, setShowCommunitySearchResult] = useState(false)
  const communitySearchResultRef = useOuterClick(() => setShowCommunitySearchResult(false))

  const communities = useCommunities()

  const generateValidationSchema = (fields: Field[]) => {
    return object().shape(
      fields.reduce((acc, field) => {
        if (['text', 'textarea', 'email', 'community'].includes(field.type)) {
          let schema = string()
          if (field.type === 'email') schema = schema.email('Invalid Email')
          if (field.minLength) schema = schema.min(field.minLength)
          if (field.maxLength) schema = schema.max(field.maxLength)
          if (field.pattern) schema = schema.matches(field.pattern)
          if (field.required) schema = schema.required(`${field.label} is required`)
          acc[field.key] = schema
        }
        return acc
      }, {} as any)
    )
  }

  useEffect(() => {
    const initialFormData = fields.reduce<FormData>((acc, field) => {
      if (field.defaultValue) {
        acc[field.key] = field.defaultValue
      }
      return acc
    }, {})

    setFormData(initialFormData)
    setCommunitySearchResult(communities)
    setValidationSchema(generateValidationSchema(fields))
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

  const onSubmit = async () => {
    if (API_URL && firebaseToken) {
      const res: Response = await (
        await fetch(`${API_URL}${url}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${firebaseToken}`,
          },
          method,
          body: JSON.stringify({ ...formData, source: 'cms' }),
        })
      ).json()
      setResponse(res)
      if (res.status === 'ok' && onSuccess) {
        onSuccess(res)
      } else if (res.status === 'error' && onError) {
        onError(res)
      }
    } else {
      console.error('environment variable for the api does not exist.')
    }
  }

  const renderField = (field: Field, props: FormikProps<FormData>) => {
    const { error_fields: responseErrors } = response || {}
    const formErrors = { ...props.errors, ...responseErrors }
    const isError = !isEmpty(formErrors) && !!formErrors![field.key]
    const message = isError ? formErrors![field.key] : undefined
    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <FormikTextField
            required={field.required}
            label={field.label}
            name={field.key}
            type="text"
            size="small"
            onChange={(e: any) => {
              changeHandler(field, e.target.value)
              props.handleChange(e)
            }}
            isError={isError}
            errorMessage={message}
            defaultValue={field.defaultValue as string}
            noMargin
          />
        )
      case 'community':
        return (
          <div ref={communitySearchResultRef} className="relative">
            <FormikTextField
              required={field.required}
              label={field.label}
              name={field.key}
              type="text"
              size="small"
              placeholder="Search"
              isError={isError}
              errorMessage={message}
              onChange={(e: any) => {
                changeHandler(field, e.target.value)
                communitySearchHandler(e.target.value)
                props.handleChange(e)
              }}
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
      <Formik
        initialValues={formData}
        onSubmit={async (values, actions) => {
          console.log('fucking valies', values)
          await onSubmit()
          actions.setSubmitting(false)
        }}
        validationSchema={validationSchema}
        validateOnBlur={false}
        validateOnChange={false}
      >
        {(props) => {
          console.log('props', props)
          return (
            <form onSubmit={props.handleSubmit}>
              <div className={formClassName}>
                {fields.map((field) => renderField(field, props))}
              </div>
              {response?.message ? (
                <p className="text-red-600 text-center">{response?.message}</p>
              ) : null}
              <div className="flex justify-end mt-5">
                <Button color="secondary" onClick={onCancel}>
                  {cancelLabel}
                </Button>
                <Button color="primary" className="ml-3" type="submit" loading={props.isSubmitting}>
                  {saveLabel}
                </Button>
              </div>
            </form>
          )
        }}
      </Formik>
    </div>
  )
}

export default DynamicForm

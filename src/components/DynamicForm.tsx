import React, { useState, useEffect } from 'react'
import { isEmpty, cloneDeep } from 'lodash'
import { Formik, FormikProps } from 'formik'
import { object, string, number } from 'yup'
import {
  FormikCheckbox,
  FormikSelectField,
  FormikTextAreaField,
  FormikTextField,
  ScheduleField,
} from './inputs'
import { Button } from './buttons'
import { Community, Shop } from '../models'
import useOuterClick from '../customHooks/useOuterClick'
import { useCommunities } from './BasePage'
import { useAuth } from '../contexts/AuthContext'
import { API_URL } from '../config/variables'
import { getCategories } from '../services/categories'
import { decimalFormat, integerFormat } from '../utils/types'
import GalleryField from './inputs/GalleryField'
import ImageField from './inputs/ImageField'

type Response = {
  status: 'ok' | 'error'
  data?: unknown
  message?: string
  error_fields?: {
    [x: string]: string
  }
}

type Option = {
  id: string
  name: string
}

export type Field = {
  type:
    | 'blank'
    | 'text'
    | 'email'
    | 'textarea'
    | 'dropdown'
    | 'checkbox'
    | 'multi-checkbox'
    | 'integer'
    | 'number'
    | 'date'
    | 'time'
    | 'schedule'
    | 'derived-schedule'
    | 'image'
    | 'gallery'
    | 'community'
    | 'categories'
  key: string
  label: string
  defaultValue?: unknown
  required?: boolean
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  options?: Option[]
  pattern?: RegExp
  format?: ''
  customizable?: boolean
  shop?: Shop
}

type FormData = {
  [x: string]: unknown
}

type Props = {
  fields: Field[]
  onSuccess?: (res?: Response) => void
  onError?: (res?: Response) => void
  onCancel?: () => void
  transformFormData?: (formData: FormData) => Promise<FormData>
  className?: string
  formClassName?: string
  saveLabel?: string
  cancelLabel?: string
  method: 'POST' | 'PUT' | 'DELETE'
  url: string
  data?: FormData
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
  data = {},
  transformFormData,
}: Props) => {
  const { firebaseToken } = useAuth()
  const [formData, setFormData] = useState<FormData>(data)
  const [response, setResponse] = useState<Response>()
  const [validationSchema, setValidationSchema] = useState<any>()

  const [categories, setCategories] = useState<Option[]>([])

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
        let schema
        switch (field.type) {
          case 'text':
          case 'textarea':
          case 'email':
          case 'community':
            schema = string()
            if (field.type === 'email') schema = schema.email('Invalid Email')
            if (field.minLength) schema = schema.min(field.minLength)
            if (field.maxLength) schema = schema.max(field.maxLength)
            if (field.pattern) schema = schema.matches(field.pattern)
            if (field.required) schema = schema.required(`${field.label} is required`)
            acc[field.key] = schema
            break
          case 'dropdown':
          case 'categories':
            schema = string()
            if (field.required) schema = schema.required(`${field.label} is required`)
            acc[field.key] = schema
            break
          case 'number':
          case 'integer':
            schema = number()
            if (field.type === 'integer') schema = schema.integer('Must be integer')
            break
          default:
            break
        }
        return acc
      }, {} as any)
    )
  }

  const setupCategories = async () => {
    const allCategories = await (
      await getCategories({}).get()
    ).docs.map((doc) => ({ id: doc.id, name: doc.data().name }))
    setCategories(allCategories)
  }

  useEffect(() => {
    if (fields.some((field) => field.type === 'categories')) {
      setupCategories()
    }
    const initialFormData = fields.reduce<FormData>((acc, field) => {
      if (field.defaultValue) {
        acc[field.key] = field.defaultValue
      }
      return acc
    }, {})

    setFormData({ ...initialFormData, ...formData })
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
    if (typeof value === 'object' && isEmpty(value) && !(value instanceof File)) {
      delete newFormData[field.key]
    } else {
      newFormData[field.key] = value
    }
    setFormData(newFormData)
  }

  const onSubmit = async () => {
    if (API_URL && firebaseToken) {
      let requestBody = formData
      if (transformFormData) {
        requestBody = await transformFormData(formData)
      }
      const res: Response = await (
        await fetch(`${API_URL}${url}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${firebaseToken}`,
          },
          method,
          body: JSON.stringify({ ...requestBody, source: 'cms' }),
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
            key={field.key}
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
            defaultValue={field.defaultValue}
            noMargin
          />
        )
      case 'number':
        return (
          <FormikTextField
            key={field.key}
            required={field.required}
            label={field.label}
            name={field.key}
            type="text"
            size="small"
            onKeyPress={(e: any) => {
              if (!decimalFormat.test(e.key) && e.key !== '.') {
                e.preventDefault()
              }
            }}
            onChange={(e: any) => {
              changeHandler(field, parseFloat(e.target.value))
              props.handleChange(e)
            }}
            isError={isError}
            errorMessage={message}
            defaultValue={field.defaultValue}
            noMargin
          />
        )
      case 'integer':
        return (
          <FormikTextField
            key={field.key}
            required={field.required}
            label={field.label}
            name={field.key}
            type="text"
            size="small"
            onKeyPress={(e: any) => {
              if (!integerFormat.test(e.key)) {
                e.preventDefault()
              }
            }}
            onChange={(e: any) => {
              changeHandler(field, parseInt(e.target.value))
              props.handleChange(e)
            }}
            isError={isError}
            errorMessage={message}
            defaultValue={field.defaultValue}
            noMargin
          />
        )
      case 'textarea':
        return (
          <FormikTextAreaField
            key={field.key}
            required={field.required}
            label={field.label}
            name={field.key}
            size="small"
            onChange={(e: any) => {
              changeHandler(field, e.target.value)
              props.handleChange(e)
            }}
            defaultValue={field.defaultValue}
            isError={isError}
            errorMessage={message}
            noMargin
          />
        )
      case 'dropdown':
        return (
          <FormikSelectField
            key={field.key}
            required={field.required}
            label={field.label}
            name={field.key}
            size="small"
            onChange={(e: any) => {
              changeHandler(field, e.target.value)
              props.handleChange(e)
            }}
            isError={isError}
            errorMessage={message}
            defaultValue={field.defaultValue}
            options={field.options}
            noMargin
          />
        )
      case 'categories':
        return (
          <FormikSelectField
            key={field.key}
            required={field.required}
            label={field.label}
            name={field.key}
            size="small"
            onChange={(e: any) => {
              changeHandler(field, e.target.value)
              props.handleChange(e)
            }}
            isError={isError}
            errorMessage={message}
            defaultValue={field.defaultValue}
            options={categories}
            placeholder="Select category"
            noMargin
          />
        )
      case 'checkbox':
        return (
          <FormikCheckbox
            key={field.key}
            label={field.label}
            name={field.key}
            size="small"
            onChange={(e: any) => {
              changeHandler(field, e.target.checked)
              props.handleChange(e)
            }}
            isError={isError}
            errorMessage={message}
            value={formData[field.key] ?? field.defaultValue}
            noMargin
          />
        )
      case 'multi-checkbox':
        return (
          <div key={field.key}>
            <p className="text-gray-600 text-lg">{field.label}</p>
            <div className="px-2">
              {field.options?.map((option) => (
                <FormikCheckbox
                  label={option.name}
                  name={option.id}
                  size="small"
                  onChange={(e: any) => {
                    const newObject = (formData[field.key] ??
                      field.options?.reduce((acc, o) => {
                        acc[o.id] = false
                        return acc
                      }, {} as any)) as { [x: string]: boolean }
                    newObject[option.id] = e.target.checked
                    changeHandler(field, newObject)
                    props.handleChange(e)
                  }}
                  isError={isError}
                  errorMessage={message}
                  value={
                    (formData[field.key] as any)?.[option.id] ??
                    (field.defaultValue as any)?.[option.id]
                  }
                  noMargin
                />
              ))}
            </div>
          </div>
        )
      case 'community':
        return (
          <div key={field.key} ref={communitySearchResultRef} className="relative">
            <FormikTextField
              required={field.required}
              label={field.label}
              name={field.key}
              type="text"
              size="small"
              placeholder="Search"
              isError={isError}
              errorMessage={message}
              onChange={(e: any) => communitySearchHandler(e.target.value)}
              value={communitySearchText}
              onFocus={() => communitySearchHandler(communitySearchText)}
              noMargin
              autoComplete="off"
            />
            {showCommunitySearchResult && communitySearchResult.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white shadow z-10 border-secondary-600 border-1">
                {communitySearchResult.map((community) => (
                  <button
                    className="w-full p-1 hover:bg-gray-200 block text-left"
                    key={community.id}
                    onClick={() => {
                      communitySelectHandler(community)
                      props.setFieldValue('community_id', community.id)
                    }}
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
      case 'schedule':
        return (
          <div key={field.key}>
            <p className="text-gray-600 text-lg">{field.label}</p>
            <div className="px-2">
              <ScheduleField
                onChange={(schedule) => changeHandler(field, schedule)}
                value={(formData[field.key] ?? field.defaultValue) as any}
              />
            </div>
          </div>
        )
      case 'gallery':
        return (
          <div key={field.key}>
            <p className="text-gray-600 text-lg">{field.label}</p>
            <div className="px-2">
              <GalleryField
                onChange={(gallery) => changeHandler(field, gallery)}
                value={(formData[field.key] ?? field.defaultValue) as any}
              />
            </div>
          </div>
        )
      case 'image':
        return (
          <div key={field.key}>
            <p className="text-gray-600 text-lg">{field.label}</p>
            <div className="px-2">
              <ImageField
                onChange={(file) => changeHandler(field, file)}
                value={(formData[field.key] ?? field.defaultValue) as any}
                name={field.key}
              />
            </div>
          </div>
        )
      case 'blank':
        return <div />
      default:
        return null
    }
  }

  return (
    <div className={className}>
      <Formik
        initialValues={formData}
        onSubmit={async (values, actions) => {
          await onSubmit()
          actions.setSubmitting(false)
        }}
        validationSchema={validationSchema}
        validateOnBlur={false}
        validateOnChange={false}
      >
        {(props) => {
          return (
            <form onSubmit={props.handleSubmit}>
              <div className={formClassName}>
                {fields.map((field) => renderField(field, props))}
              </div>
              {response?.message || response?.error_fields ? (
                <p className="text-red-600 text-center">
                  {response?.message || 'Something went wrong. Please try again.'}
                </p>
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
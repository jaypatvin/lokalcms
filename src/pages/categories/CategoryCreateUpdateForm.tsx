import React, { ChangeEvent, useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '../../components/buttons'
import Dropdown from '../../components/Dropdown'
import { TextField } from '../../components/inputs'
import Modal from '../../components/modals'
import { API_URL } from '../../config/variables'
import { useAuth } from '../../contexts/AuthContext'
import { storage } from '../../services/firebase'
import { statusColorMap } from '../../utils/types'

type Props = {
  isOpen?: boolean
  setIsOpen: (val: boolean) => void
  mode?: 'create' | 'update'
  categoryToUpdate?: any
  isModal?: boolean
}

const initialData = {}

const CategoryCreateUpdateForm = ({
  isOpen = false,
  setIsOpen,
  mode = 'create',
  categoryToUpdate,
  isModal = true,
}: Props) => {
  const history = useHistory()
  const [data, setData] = useState<any>(categoryToUpdate || initialData)
  const [responseData, setResponseData] = useState<any>({})
  const { firebaseToken } = useAuth()

  useEffect(() => {
    if (categoryToUpdate) {
      setData(categoryToUpdate)
    } else {
      setData(initialData)
    }
  }, [categoryToUpdate])

  const changeHandler = (field: string, value: string | number | boolean | null) => {
    const newData = { ...data }
    newData[field] = value
    setData(newData)
  }

  const fileChangeHandler = (e: ChangeEvent<HTMLInputElement>, field: string) => {
    const newData = { ...data }
    if (!e.target.files) {
      if (newData[field]) {
        newData[field] = ''
        setData(newData)
      }
      return
    }
    newData[`${field}_file`] = e.target.files[0]
    newData[`${field}_preview`] = URL.createObjectURL(e.target.files[0])
    setData(newData)
  }

  const removePhotoHandler = (field: string) => {
    const newData = { ...data }
    if (newData[field]) {
      newData[field] = ''
    }
    if (newData[`${field}_file`]) delete newData[`${field}_file`]
    if (newData[`${field}_preview`]) delete newData[`${field}_preview`]
    setData(newData)
  }

  const onSave = async () => {
    if (API_URL && firebaseToken) {
      let url = `${API_URL}/categories`
      let method = 'POST'
      if (mode === 'update' && data.id) {
        url = `${url}/${data.id}`
        method = 'PUT'
      }
      if (data.icon_url_file) {
        const uuid = uuidv4()
        const upload = await storage
          .ref(`/images/categories/icon-${data.id || data.name}_${uuid}`)
          .put(data.icon_url_file)
        data.icon_url = await upload.ref.getDownloadURL()
        delete data.icon_url_file
        delete data.icon_url_preview
      }
      if (data.cover_url_file) {
        const uuid = uuidv4()
        const upload = await storage
          .ref(`/images/categories/cover-${data.id || data.name}_${uuid}`)
          .put(data.cover_url_file)
        data.cover_url = await upload.ref.getDownloadURL()
        delete data.cover_url_file
        delete data.cover_url_preview
      }
      console.log('data', data)
      let res: any = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firebaseToken}`,
        },
        method,
        body: JSON.stringify(data),
      })
      res = await res.json()
      setResponseData(res)
      if (res.status !== 'error') {
        setResponseData({})
        setData(initialData)
        if (setIsOpen) {
          setIsOpen(false)
        } else if (!isModal) {
          history.push('/categories')
        }
      }
    } else {
      console.error('environment variable for the api does not exist.')
    }
  }

  const fieldIsError = (field: string) => {
    const { status, error_fields } = responseData
    if (status === 'error' && error_fields && error_fields.length) {
      return error_fields.includes(field)
    }
    return false
  }

  return (
    <Modal title={`${mode} Category`} isOpen={isOpen} setIsOpen={setIsOpen} onSave={onSave}>
      <div className="flex justify-between mb-3">
        <Dropdown
          name="Status"
          simpleOptions={['enabled', 'disabled']}
          currentValue={data.status}
          size="small"
          onSelect={(option) => changeHandler('status', option.value)}
          buttonColor={statusColorMap[data.status]}
        />
      </div>
      <div className="grid grid-cols-2 gap-x-2">
        <TextField
          required
          label="name"
          type="text"
          size="small"
          onChange={(e) => changeHandler('name', e.target.value)}
          isError={fieldIsError('name')}
          value={data.name}
          readOnly={mode === 'update'}
        />
        <TextField
          label="description"
          type="text"
          size="small"
          onChange={(e) => changeHandler('description', e.target.value)}
          isError={fieldIsError('description')}
          value={data.description}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="w-40 h-40 relative">
          {(data.icon_url || data.icon_url_preview) && (
            <button
              className="text-white absolute top-1 right-1 text-xs z-30 bg-danger-600 p-1"
              onClick={() => removePhotoHandler('icon_url')}
            >
              X
            </button>
          )}
          <label
            htmlFor="icon"
            className="bg-black bg-opacity-25 text-white cursor-pointer h-full w-full flex items-center justify-center absolute top-0 left-0 text-4xl z-20 hover:bg-opacity-0 transition-all"
          >
            Icon
          </label>
          <input
            id="icon"
            type="file"
            name={'icon'}
            onChange={(e) => fileChangeHandler(e, 'icon_url')}
            className="hidden"
          />
          {(data.icon_url || data.icon_url_preview) && (
            <img
              className="w-full h-full absolute top-0 left-0 z-10"
              src={
                data.icon_url_preview ||
                data.icon_url ||
                'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
              }
              alt="icon"
            />
          )}
          <span className=" bg-black bg-opacity-10 text-white h-full w-full flex items-center justify-center absolute top-0 left-0 text-4xl z-0">
            Icon
          </span>
        </div>
        <div className="w-40 h-40 relative">
          {(data.cover_url || data.cover_url_preview) && (
            <button
              className="text-white absolute top-1 right-1 text-xs z-30 bg-danger-600 p-1"
              onClick={() => removePhotoHandler('cover_url')}
            >
              X
            </button>
          )}
          <label
            htmlFor="cover"
            className="bg-black bg-opacity-25 text-white cursor-pointer h-full w-full flex items-center justify-center absolute top-0 left-0 text-4xl z-20 hover:bg-opacity-0 transition-all"
          >
            Cover
          </label>
          <input
            id="cover"
            type="file"
            name={'cover'}
            onChange={(e) => fileChangeHandler(e, 'cover_url')}
            className="hidden"
          />
          {(data.cover_url || data.cover_url_preview) && (
            <img
              className="w-full h-full absolute top-0 left-0 z-10"
              src={
                data.cover_url_preview ||
                data.cover_url ||
                'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
              }
              alt="cover"
            />
          )}
          <span className=" bg-black bg-opacity-10 text-white h-full w-full flex items-center justify-center absolute top-0 left-0 text-4xl z-0">
            Cover
          </span>
        </div>
      </div>
      {responseData.status === 'error' && (
        <p className="text-red-600 text-center">{responseData.message}</p>
      )}
      {!isModal && (
        <div className="flex justify-end">
          <Link to="/users">
            <Button color="secondary">Cancel</Button>
          </Link>
          <Button color="primary" className="ml-3" onClick={onSave}>
            Save
          </Button>
        </div>
      )}
    </Modal>
  )
}

export default CategoryCreateUpdateForm

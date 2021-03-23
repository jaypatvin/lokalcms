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
  productToUpdate?: any
  isModal?: boolean
}

const initialData = {}
const maxNumOfPhotos = 6 // TODO: this should be configurable on the CMS

const ProductCreateUpdateForm = ({
  isOpen = false,
  setIsOpen,
  mode = 'create',
  productToUpdate,
  isModal = true,
}: Props) => {
  const history = useHistory()
  const [data, setData] = useState<any>(productToUpdate || initialData)
  const [responseData, setResponseData] = useState<any>({})
  const { firebaseToken } = useAuth()

  useEffect(() => {
    if (productToUpdate) {
      setData(productToUpdate)
    } else {
      setData(initialData)
    }
  }, [productToUpdate])

  const changeHandler = (field: string, value: string | number | boolean | null) => {
    const newData = { ...data }
    newData[field] = value
    setData(newData)
  }

  const fileChangeHandler = (e: ChangeEvent<HTMLInputElement>, order: number) => {
    const newData = { ...data }
    if (!e.target.files) {
      if (newData.gallery) {
        newData.gallery = newData.gallery.filter((photo: any) => photo.order !== order)
        setData(newData)
      }
      return
    }
    if (!newData.gallery) newData.gallery = []
    const photo = newData.gallery.find((file: any) => file.order === order)
    if (photo) {
      photo.file = e.target.files[0]
      photo.preview = URL.createObjectURL(e.target.files[0])
    } else {
      newData.gallery.push({
        order,
        file: e.target.files[0],
        preview: URL.createObjectURL(e.target.files[0]),
      })
    }
    setData(newData)
  }

  const removePhotoHandler = (order: number) => {
    const newData = { ...data }
    if (newData.gallery && newData.gallery.length) {
      const photo = newData.gallery.find((photo: any) => photo.order === order)
      if (photo) {
        if (photo.hasOwnProperty('url')) {
          photo.url = ''
        } else {
          newData.gallery = newData.gallery.filter((photo: any) => photo.order !== order)
        }
        setData(newData)
      }
    }
  }

  const onSave = async () => {
    if (API_URL && firebaseToken) {
      let url = `${API_URL}/products`
      let method = 'POST'
      if (mode === 'update' && data.id) {
        url = `${url}/${data.id}`
        method = 'PUT'
      }
      if (data.gallery && data.gallery.length) {
        for (let i = 0; i < data.gallery.length; i++) {
          const photo = data.gallery[i]
          if (photo.file) {
            const uuid = uuidv4()
            const upload = await storage
              .ref(`/images/products/${data.id || data.shop_id}_${uuid}`)
              .put(photo.file)
            photo.url = await upload.ref.getDownloadURL()
            delete photo.file
            delete photo.preview
          }
        }
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
          history.push('/products')
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
    <Modal title={`${mode} Product`} isOpen={isOpen} setIsOpen={setIsOpen} onSave={onSave}>
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
        />
        <TextField
          required
          label="description"
          type="text"
          size="small"
          onChange={(e) => changeHandler('description', e.target.value)}
          isError={fieldIsError('description')}
          value={data.description}
        />
        <TextField
          required
          label="shop"
          type="text"
          size="small"
          onChange={(e) => changeHandler('shop_id', e.target.value)}
          isError={fieldIsError('shop_id')}
          value={data.shop_id}
        />
        <TextField
          required
          label="price"
          type="text"
          size="small"
          onChange={(e) => changeHandler('base_price', e.target.value)}
          isError={fieldIsError('base_price')}
          value={data.base_price}
        />
        <TextField
          required
          label="quantity"
          type="text"
          size="small"
          onChange={(e) => changeHandler('quantity', e.target.value)}
          isError={fieldIsError('quantity')}
          value={data.quantity}
        />
        <TextField
          required
          label="category"
          type="text"
          size="small"
          onChange={(e) => changeHandler('product_category', e.target.value)}
          isError={fieldIsError('product_category')}
          value={data.product_category}
        />
      </div>
      <div>
        <p>Gallery</p>
        <div className="grid grid-cols-2 gap-2">
          {[...Array(maxNumOfPhotos)].map((x, i) => {
            let havePhoto = false
            let currentPhoto
            if (data.gallery && data.gallery.length) {
              currentPhoto = data.gallery.find((file: any) => file.order === i)
              if (currentPhoto && (currentPhoto.url || currentPhoto.preview)) havePhoto = true
            }
            return (
              <div key={i} className="w-40 h-40 relative">
                {havePhoto && (
                  <button
                    className="text-white absolute top-1 right-1 text-xs z-30 bg-danger-600 p-1"
                    onClick={() => removePhotoHandler(i)}
                  >
                    X
                  </button>
                )}
                <label
                  htmlFor={`photo_${i}`}
                  className="bg-black bg-opacity-25 text-white cursor-pointer h-full w-full flex items-center justify-center absolute top-0 left-0 text-4xl z-20 hover:bg-opacity-0 transition-all"
                >
                  {i + 1}
                </label>
                <input
                  id={`photo_${i}`}
                  type="file"
                  name={`photo_${i}`}
                  onChange={(e) => fileChangeHandler(e, i)}
                  className="hidden"
                />
                {havePhoto && (
                  <img
                    className="w-full h-full absolute top-0 left-0 z-10"
                    src={
                      currentPhoto.preview ||
                      currentPhoto.url ||
                      'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
                    }
                    alt={currentPhoto.order}
                  />
                )}
                <span className=" bg-black bg-opacity-10 text-white h-full w-full flex items-center justify-center absolute top-0 left-0 text-4xl z-0">
                  {i + 1}
                </span>
              </div>
            )
          })}
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

export default ProductCreateUpdateForm

import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Button } from '../../components/buttons'
import Dropdown from '../../components/Dropdown'
import { TextField } from '../../components/inputs'
import Modal from '../../components/modals'
import { API_URL } from '../../config/variables'
import { useAuth } from '../../contexts/AuthContext'
import { statusColorMap } from '../../utils/types'

type Props = {
  isOpen?: boolean
  setIsOpen: (val: boolean) => void
  mode?: 'create' | 'update'
  productToUpdate?: any
  isModal?: boolean
}

const initialData = {}

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

  const onSave = async () => {
    if (API_URL && firebaseToken) {
      let url = `${API_URL}/products`
      let method = 'POST'
      if (mode === 'update' && data.id) {
        url = `${url}/${data.id}`
        method = 'PUT'
      }
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

import React, { ChangeEvent, useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import ReactCalendar, { CalendarTileProperties } from 'react-calendar'
import { isFinite } from 'lodash'
import { Button } from '../../components/buttons'
import Dropdown from '../../components/Dropdown'
import { TextField, Checkbox } from '../../components/inputs'
import Modal from '../../components/modals'
import { API_URL } from '../../config/variables'
import { useAuth } from '../../contexts/AuthContext'
import { storage } from '../../services/firebase'
import { CreateUpdateFormProps, statusColorMap } from '../../utils/types'
import { fetchShopByID } from '../../services/shops'
import dayjs from 'dayjs'
import { isAvailableByDefault } from '../../utils/dates'
import { Product, Shop } from '../../models'

type Response = {
  status?: string
  data?: Product
  message?: string
  error_fields?: Field[]
}

type Gallery = {
  url?: string
  order: number
  file?: File
  preview?: string
}[]

type ProductFormType = {
  id?: string
  status?: 'enabled' | 'disabled'
  name?: string
  description?: string
  shop_id?: string
  base_price?: number
  quantity?: number
  product_category?: string
  gallery?: Gallery
  availability?: Omit<Product['availability'], 'schedule'>
}

type Field =
  | 'status'
  | 'name'
  | 'description'
  | 'shop_id'
  | 'base_price'
  | 'quantity'
  | 'product_category'

const initialData: ProductFormType = {}
const maxNumOfPhotos = 6 // TODO: this should be configurable on the CMS

const ProductCreateUpdateForm = ({
  isOpen = false,
  setIsOpen,
  mode = 'create',
  dataToUpdate,
  isModal = true,
}: CreateUpdateFormProps) => {
  const history = useHistory()
  const [openAvailability, setOpenAvailability] = useState(false)
  const [useCustomAvailability, setUseCustomAvailability] = useState(
    dataToUpdate ? dataToUpdate.custom_availability : false
  )
  const [unavailableDates, setUnavailableDates] = useState<string[]>(
    dataToUpdate ? dataToUpdate.unavailable_dates : []
  )
  const [data, setData] = useState<ProductFormType>(dataToUpdate || initialData)
  const [responseData, setResponseData] = useState<Response>({})
  const [shop, setShop] = useState<Shop>()
  const { firebaseToken } = useAuth()

  const getShopData = async () => {
    if (data.shop_id) {
      const shop = await fetchShopByID(data.shop_id)
      if (shop.exists) {
        const shopData = shop.data()
        setShop(shopData)
      } else {
        console.error(`shop with id ${data.shop_id} does not exist.`)
      }
    }
  }

  useEffect(() => {
    if (dataToUpdate) {
      setData(dataToUpdate)
    } else {
      setData(initialData)
    }
  }, [dataToUpdate])

  useEffect(() => {
    if (useCustomAvailability && data.shop_id) {
      getShopData()
    }
  }, [useCustomAvailability])

  const changeHandler = (field: Field, value: string) => {
    if (field === 'shop_id') {
      setUseCustomAvailability(false)
      setUnavailableDates([])
    }
    const newData = { ...data }
    if (field === 'status' && (value === 'enabled' || value === 'disabled')) {
      newData.status = value
    } else if (
      field === 'name' ||
      field === 'description' ||
      field === 'shop_id' ||
      field === 'product_category'
    ) {
      newData[field] = value
    } else if (field === 'base_price' || field === 'quantity') {
      const numValue = parseInt(value)
      if (isFinite(numValue) && numValue > 0) {
        newData[field] = numValue
      }
    }
    setData(newData)
  }

  const fileChangeHandler = (e: ChangeEvent<HTMLInputElement>, order: number) => {
    const newData = { ...data }
    if (!e.target.files) {
      if (newData.gallery) {
        newData.gallery = newData.gallery.filter((photo) => photo.order !== order)
        setData(newData)
      }
      return
    }
    if (!newData.gallery) newData.gallery = []
    const photo = newData.gallery.find((file) => file.order === order)
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
      const photo = newData.gallery.find((photo) => photo.order === order)
      if (photo) {
        if (photo.hasOwnProperty('url')) {
          photo.url = ''
        } else {
          newData.gallery = newData.gallery.filter((photo) => photo.order !== order)
        }
        setData(newData)
      }
    }
  }

  const constructAvailability = () => {
    const { repeat_type, repeat_unit, start_time, end_time, start_dates, schedule } =
      shop!.operating_hours
    let unavailable_dates = unavailableDates
    const custom_dates: { date: string }[] = []
    if (schedule && schedule.custom) {
      Object.entries(schedule.custom).forEach(([key, val]) => {
        if (val.unavailable && !dataToUpdate) {
          unavailable_dates.push(key)
        } else if (!unavailable_dates.includes(key) && (val.start_time || val.end_time)) {
          custom_dates.push({ date: key })
        }
      })
    }
    const availability = {
      start_time,
      end_time,
      start_dates,
      repeat_unit,
      repeat_type,
      unavailable_dates,
      custom_dates: custom_dates.length ? custom_dates : [],
    }
    return availability
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
      const productData = { ...data }
      if (useCustomAvailability && unavailableDates.length) {
        productData.availability = constructAvailability()
      }
      console.log('data', productData)
      let res = await (
        await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${firebaseToken}`,
          },
          method,
          body: JSON.stringify({ ...productData, source: 'cms' }),
        })
      ).json()
      setResponseData(res)
      if (res.status !== 'error') {
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

  const fieldIsError = (field: Field) => {
    const { status, error_fields } = responseData
    if (status === 'error' && error_fields && error_fields.length) {
      return error_fields.includes(field)
    }
    return false
  }

  const onCustomizeDates = (date: Date) => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD')
    if (unavailableDates.includes(formattedDate)) {
      const newUnavailableDates = unavailableDates.filter((d) => !dayjs(d).isSame(formattedDate))
      setUnavailableDates(newUnavailableDates)
    } else if (isAvailableByDefault(date, shop)) {
      const newUnavailableDates = [...unavailableDates]
      newUnavailableDates.push(dayjs(date).format('YYYY-MM-DD'))
      setUnavailableDates(newUnavailableDates)
    }
  }

  const getTileClass = ({ date }: CalendarTileProperties) => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD')
    if (unavailableDates.includes(formattedDate)) {
      return null
    } else if (isAvailableByDefault(date, shop)) {
      return 'orange'
    }
    return null
  }

  return (
    <Modal title={`${mode} Product`} isOpen={isOpen} setIsOpen={setIsOpen} onSave={onSave}>
      <div className="flex justify-between mb-3">
        <Dropdown
          name="Status"
          simpleOptions={['enabled', 'disabled']}
          currentValue={data.status}
          size="small"
          onSelect={(option) => changeHandler('status', option.value as string)}
          buttonColor={statusColorMap[data.status ?? 'enabled']}
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
          value={data.base_price?.toString()}
        />
        <TextField
          required
          label="quantity"
          type="text"
          size="small"
          onChange={(e) => changeHandler('quantity', e.target.value)}
          isError={fieldIsError('quantity')}
          value={data.quantity?.toString()}
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
              currentPhoto = data.gallery.find((file) => file.order === i)
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
                      currentPhoto?.preview ||
                      currentPhoto?.url ||
                      'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
                    }
                    alt={`#${currentPhoto?.order}`}
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
      <div>
        <Checkbox
          label="Set Availability"
          onChange={() => setOpenAvailability(!openAvailability)}
          noMargin
          value={openAvailability}
        />
      </div>
      {openAvailability && (
        <div className="p-2">
          <Checkbox
            label="Use shop schedule"
            onChange={() => setUseCustomAvailability(!useCustomAvailability)}
            noMargin
            value={!useCustomAvailability}
          />
          <Checkbox
            label="Use custom availability"
            onChange={() => setUseCustomAvailability(!useCustomAvailability)}
            noMargin
            value={useCustomAvailability}
          />
          {useCustomAvailability && shop && (
            <ReactCalendar
              className="w-72"
              onChange={(date: any) => onCustomizeDates(date)}
              tileDisabled={({ date }) => !isAvailableByDefault(date, shop)}
              tileClassName={getTileClass}
              calendarType="US"
              value={null}
            />
          )}
        </div>
      )}
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

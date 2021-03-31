import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Button } from '../../components/buttons'
import Dropdown from '../../components/Dropdown'
import { Checkbox, TextField } from '../../components/inputs'
import Modal from '../../components/modals'
import { API_URL } from '../../config/variables'
import { useAuth } from '../../contexts/AuthContext'
import { CreateUpdateFormProps, CustomHoursType, DaysSchedType, DaysType, statusColorMap } from '../../utils/types'

const initialData = {}
const days: DaysType[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const ShopCreateUpdateForm = ({
  isOpen = false,
  setIsOpen,
  mode = 'create',
  dataToUpdate,
  isModal = true,
}: CreateUpdateFormProps) => {
  const history = useHistory()
  const [data, setData] = useState<any>(dataToUpdate || initialData)
  const [customHours, setCustomHours] = useState<CustomHoursType>(
    dataToUpdate ? dataToUpdate.custom_hours : {}
  )
  const [responseData, setResponseData] = useState<any>({})
  const { firebaseToken } = useAuth()

  useEffect(() => {
    if (dataToUpdate) {
      setData(dataToUpdate)
    } else {
      setData(initialData)
    }
  }, [dataToUpdate])

  const changeHandler = (field: string, value: string | number | boolean | null) => {
    const newData = { ...data }
    newData[field] = value
    setData(newData)
  }

  const customHoursChangeHandler = (day: DaysType, field: DaysSchedType, value: string) => {
    const newCustomHours = { ...customHours }
    if(newCustomHours[day]) {
      newCustomHours[day] = { ...newCustomHours[day], [field]: value }
    } else {
      newCustomHours[day] = { [field]: value }
    }
    const newData = { ...data }
    newData.custom_hours = newCustomHours
    setCustomHours(newCustomHours)
    setData(newData)
  }

  const onSave = async () => {
    if (API_URL && firebaseToken) {
      let url = `${API_URL}/shops`
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
          history.push('/shops')
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
    <Modal title={`${mode} Shop`} isOpen={isOpen} setIsOpen={setIsOpen} onSave={onSave}>
      <div className="flex justify-between mb-3">
        <Dropdown
          name="Status"
          simpleOptions={['enabled', 'disabled']}
          currentValue={data.status}
          size="small"
          onSelect={(option) => changeHandler('status', option.value)}
          buttonColor={statusColorMap[data.status]}
        />
        <Checkbox
          label="Is Close"
          onChange={(e) => changeHandler('is_close', e.target.checked)}
          noMargin
          value={data.is_close || false}
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
          label="user"
          type="text"
          size="small"
          onChange={(e) => changeHandler('user_id', e.target.value)}
          isError={fieldIsError('user_id')}
          value={data.user_id}
        />
        <TextField
          required
          label="opening"
          type="text"
          size="small"
          onChange={(e) => changeHandler('opening', e.target.value)}
          isError={fieldIsError('opening')}
          value={data.opening}
        />
        <TextField
          required
          label="closing"
          type="text"
          size="small"
          onChange={(e) => changeHandler('closing', e.target.value)}
          isError={fieldIsError('closing')}
          value={data.closing}
        />
      </div>
      <div>
        <Checkbox
          label="Use custom hours"
          onChange={(e) => changeHandler('use_custom_hours', e.target.checked)}
          noMargin
          value={data.use_custom_hours || false}
        />
      </div>
      {data.use_custom_hours &&
        days.map((day) => (
          <div>
            <p>{day}</p>
            <div className="grid grid-cols-2 gap-x-2 mb-2">
              <TextField
                required
                placeholder="opening"
                type="test"
                size="small"
                onChange={(e) => customHoursChangeHandler(day, 'opening', e.target.value)}
                value={customHours[day]?.opening}
                noMargin
              />
              <TextField
                required
                placeholder="closing"
                type="text"
                size="small"
                onChange={(e) => customHoursChangeHandler(day, 'closing', e.target.value)}
                value={customHours[day]?.closing}
                noMargin
              />
            </div>
          </div>
        ))}
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

export default ShopCreateUpdateForm

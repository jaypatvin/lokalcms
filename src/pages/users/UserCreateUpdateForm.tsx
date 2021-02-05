import React, { useState } from 'react'
import Dropdown from '../../components/Dropdown'
import { Checkbox, TextField } from '../../components/inputs'
import Modal from '../../components/modals'

type Props = {
  isOpen: boolean
  setIsOpen: (val: boolean) => void
  mode?: 'create' | 'update'
  userToUpdate?: any
}

const initialData = { status: 'active' }

const UserCreateUpdateForm = ({ isOpen, setIsOpen, mode = 'create', userToUpdate }: Props) => {
  console.log('mode', mode)
  console.log('userToUpdate', userToUpdate)
  const [data, setData] = useState<any>(userToUpdate || initialData)
  const [responseData, setResponseData] = useState<any>({})

  const changeHandler = (field: string, value: string | number | boolean | null) => {
    const newData = { ...data }
    newData[field] = value
    setData(newData)
  }

  const onSave = async () => {
    console.log('data', data)
    if (process.env.REACT_APP_API_URL) {
      let url = `${process.env.REACT_APP_API_URL}/users`
      if (mode === 'update' && data.id) {
        url = `${url}/${data.id}`
      }
      let res: any = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PUT',
        body: JSON.stringify(data),
      })
      res = await res.json()
      setResponseData(res)
      if (res.status !== 'error') {
        setResponseData({})
        setData(initialData)
        setIsOpen(false)
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
    <Modal title={`${mode} user`} isOpen={isOpen} setIsOpen={setIsOpen} onSave={onSave}>
      <div className="flex justify-between mb-3">
        <Dropdown
          name="status"
          simpleOptions={['active', 'suspended', 'pending', 'locked']}
          currentValue={data.status}
          size="small"
          onSelect={(option) => changeHandler('status', option.value)}
        />
        <Checkbox label="Admin" onChange={(e) => changeHandler('is_admin', e.target.checked)} noMargin value={data.is_admin} />
      </div>
      <div className="grid grid-cols-2 gap-x-2">
        <TextField
          required
          label="email"
          type="email"
          size="small"
          onChange={(e) => changeHandler('email', e.target.value)}
          isError={fieldIsError('email')}
          defaultValue={data.email}
        />
        <TextField
          required
          label="first name"
          type="text"
          size="small"
          onChange={(e) => changeHandler('first_name', e.target.value)}
          isError={fieldIsError('first_name')}
          defaultValue={data.first_name}
        />
        <TextField
          required
          label="last name"
          type="text"
          size="small"
          onChange={(e) => changeHandler('last_name', e.target.value)}
          isError={fieldIsError('last_name')}
          defaultValue={data.last_name}
        />
        <TextField
          label="display name"
          type="text"
          size="small"
          onChange={(e) => changeHandler('display_name', e.target.value)}
          isError={fieldIsError('display_name')}
          defaultValue={data.display_name}
        />
        <TextField
          label="profile photo"
          type="text"
          size="small"
          onChange={(e) => changeHandler('profile_photo', e.target.value)}
          isError={fieldIsError('profile_photo')}
          defaultValue={data.profile_photo}
        />
        <TextField
          required
          label="community_id"
          type="text"
          size="small"
          onChange={(e) => changeHandler('community_id', e.target.value)}
          isError={fieldIsError('community_id')}
          defaultValue={data.community_id}
        />
        <TextField
          required
          label="street"
          type="text"
          size="small"
          onChange={(e) => changeHandler('street', e.target.value)}
          isError={fieldIsError('street')}
          defaultValue={data.street}
        />
      </div>
      {responseData.status === 'error' && (
        <p className="text-red-600 text-center">{responseData.message}</p>
      )}
    </Modal>
  )
}

export default UserCreateUpdateForm

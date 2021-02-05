import React, { useState } from 'react'
import Dropdown from '../../components/Dropdown'
import { TextField } from '../../components/inputs'
import Modal from '../../components/modals'

type Props = {
  isOpen: boolean
  setIsOpen: (val: boolean) => void
  mode?: 'create' | 'update'
}

const initialData = { status: 'active' }

const UserCreateUpdateForm = ({ isOpen, setIsOpen, mode = 'create' }: Props) => {
  const [data, setData] = useState<any>(initialData)
  const [responseData, setResponseData] = useState<any>({})
  const changeHandler = (field: string, value: string | number | null) => {
    const newData = { ...data }
    newData[field] = value
    setData(newData)
  }

  const onSave = async () => {
    console.log(data)
    let res: any = await fetch('http://localhost:5001/lokal-1baac/us-central1/api/v1/users', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(data),
    })
    res = await res.json()
    setResponseData(res)
    if (res.status !== 'error') {
      setResponseData({})
      setData(initialData)
      setIsOpen(false)
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
      <Dropdown
        name="status"
        simpleOptions={['active', 'suspended', 'pending', 'locked']}
        currentValue={data.status}
        size="small"
        onSelect={(option) => changeHandler('status', option.value)}
      />
      <div className="grid grid-cols-2 gap-x-2">
        <TextField
          required
          label="email"
          type="email"
          size="small"
          onChange={(e) => changeHandler('email', e.target.value)}
          isError={fieldIsError('email')}
          initialValue={data['email']}
        />
        <TextField
          required
          label="first name"
          type="text"
          size="small"
          onChange={(e) => changeHandler('first_name', e.target.value)}
          isError={fieldIsError('first_name')}
          initialValue={data['first_name']}
        />
        <TextField
          required
          label="last name"
          type="text"
          size="small"
          onChange={(e) => changeHandler('last_name', e.target.value)}
          isError={fieldIsError('last_name')}
          initialValue={data['last_name']}
        />
        <TextField
          label="display name"
          type="text"
          size="small"
          onChange={(e) => changeHandler('display_name', e.target.value)}
          isError={fieldIsError('display_name')}
          initialValue={data['display_name']}
        />
        <TextField
          label="profile photo"
          type="text"
          size="small"
          onChange={(e) => changeHandler('profile_photo', e.target.value)}
          isError={fieldIsError('profile_photo')}
          initialValue={data['profile_photo']}
        />
        <TextField
          required
          label="community_id"
          type="text"
          size="small"
          onChange={(e) => changeHandler('community_id', e.target.value)}
          isError={fieldIsError('community_id')}
          initialValue={data['community_id']}
        />
        <TextField
          required
          label="street"
          type="text"
          size="small"
          onChange={(e) => changeHandler('street', e.target.value)}
          isError={fieldIsError('street')}
          initialValue={data['street']}
        />
      </div>
      {responseData.status === 'error' && (
        <p className="text-red-600 text-center">{responseData.message}</p>
      )}
    </Modal>
  )
}

export default UserCreateUpdateForm

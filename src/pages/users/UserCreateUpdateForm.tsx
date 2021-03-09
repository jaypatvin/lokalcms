import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Button } from '../../components/buttons'
import Dropdown from '../../components/Dropdown'
import { Checkbox, TextField } from '../../components/inputs'
import Modal from '../../components/modals'
import { API_URL } from '../../config/variables'
import { statusColorMap } from '../../utils/types'
import { useAuth } from '../../contexts/AuthContext'

type Props = {
  isOpen?: boolean
  setIsOpen?: (val: boolean) => void
  mode?: 'create' | 'update'
  userToUpdate?: any
  isModal?: boolean
}

const initialData = { status: 'active' }

const UserCreateUpdateForm = ({
  isOpen = false,
  setIsOpen,
  mode = 'create',
  userToUpdate,
  isModal = true,
}: Props) => {
  const history = useHistory()
  const { firebaseToken } = useAuth()
  const [data, setData] = useState<any>(userToUpdate || initialData)
  const [responseData, setResponseData] = useState<any>({})
  const [WrapperComponent, setWrapperComponent] = useState<any>()

  useEffect(() => {
    if (isModal && setIsOpen) {
      const Component = ({ children, isOpen, setIsOpen, onSave }: any) => (
        <Modal title={`${mode} user`} isOpen={isOpen} setIsOpen={setIsOpen} onSave={onSave}>
          {children}
        </Modal>
      )
      setWrapperComponent(() => Component)
    } else {
      const Component = ({ children }: any) => <>{children}</>
      setWrapperComponent(() => Component)
    }
  }, [isModal, userToUpdate, setIsOpen, isOpen, mode])

  useEffect(() => {
    if (userToUpdate) {
      setData(userToUpdate)
    } else {
      setData(initialData)
    }
  }, [userToUpdate])

  const changeHandler = (field: string, value: string | number | boolean | null) => {
    const newData = { ...data }
    newData[field] = value
    setData(newData)
  }

  const onSave = async () => {
    if (API_URL && firebaseToken) {
      let url = `${API_URL}/users`
      let method = 'POST'
      if (mode === 'update' && userToUpdate.id) {
        for (let key in data) {
          if (data[key] === userToUpdate[key]) delete data[key]
        }
        url = `${url}/${userToUpdate.id}`
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
          history.push('/users')
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

  if (!WrapperComponent) return null

  return (
    <WrapperComponent title={`${mode} user`} isOpen={isOpen} setIsOpen={setIsOpen} onSave={onSave}>
      <div className="flex justify-between mb-3">
        <Dropdown
          name="status"
          simpleOptions={['active', 'suspended', 'pending', 'locked']}
          currentValue={data.status}
          size="small"
          onSelect={(option) => changeHandler('status', option.value)}
          buttonColor={statusColorMap[data.status]}
        />
        <Checkbox
          label="Admin"
          onChange={(e) => changeHandler('is_admin', e.target.checked)}
          noMargin
          value={data.is_admin || false}
        />
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
          readOnly={mode === 'update'}
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
    </WrapperComponent>
  )
}

export default UserCreateUpdateForm

import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Button } from '../../components/buttons'
import Dropdown from '../../components/Dropdown'
import { Checkbox } from '../../components/inputs'
import { API_URL } from '../../config/variables'
import { CreateUpdateFormProps, statusColorMap } from '../../utils/types'
import { useAuth } from '../../contexts/AuthContext'
import { fetchCommunityByID } from '../../services/community'
import { Community, User } from '../../models'
import DynamicForm, { Field as DynamicField } from '../../components/DynamicForm'
import Modal from '../../components/modals'

type Response = {
  status?: string
  data?: User
  message?: string
  error_fields?: {
    [x: string]: string
  }
}

type UserFormType = {
  id?: string
  status?: 'active' | 'suspended' | 'pending' | 'locked'
  is_admin?: boolean
  email?: string
  first_name?: string
  last_name?: string
  display_name?: string
  profile_photo?: string
  street?: string
}

type Field =
  | 'status'
  | 'is_admin'
  | 'email'
  | 'first_name'
  | 'last_name'
  | 'display_name'
  | 'profile_photo'
  | 'street'
  | 'community_id'

const initialData: UserFormType = { status: 'active' }

const fields: DynamicField[] = [
  {
    type: 'community',
    key: 'community_id',
    label: 'Community',
    required: true,
  },
  {
    type: 'email',
    key: 'email',
    label: 'Email',
    required: true,
  },
  {
    type: 'text',
    key: 'first_name',
    label: 'First Name',
    required: true,
  },
  {
    type: 'text',
    key: 'last_name',
    label: 'Last Name',
    required: true,
  },
  {
    type: 'text',
    key: 'display_name',
    label: 'Display Name',
    required: false,
  },
  {
    type: 'text',
    key: 'profile_photo',
    label: 'Profile Photo',
    required: false,
  },
  {
    type: 'text',
    key: 'street',
    label: 'Street',
    required: true,
  },
]

const UserCreateUpdateForm = ({
  isOpen = false,
  setIsOpen,
  mode = 'create',
  dataToUpdate,
  isModal = true,
}: CreateUpdateFormProps) => {
  const history = useHistory()
  const { firebaseToken } = useAuth()
  const [data, setData] = useState<UserFormType>(dataToUpdate || initialData)
  const [responseData, setResponseData] = useState<Response>({})
  const [WrapperComponent, setWrapperComponent] = useState<any>()
  const [community, setCommunity] = useState<Community>()

  useEffect(() => {
    if (isModal && setIsOpen) {
      const Component = ({ children, isOpen }: any) => (
        <Modal title={`${mode} user`} isOpen={isOpen}>
          {children}
        </Modal>
      )
      setWrapperComponent(() => Component)
    } else {
      const Component = ({ children }: any) => <>{children}</>
      setWrapperComponent(() => Component)
    }
  }, [isModal, dataToUpdate, setIsOpen, isOpen, mode, community])

  const setCurrentData = async () => {
    const { community_id } = dataToUpdate
    const communityRef = await fetchCommunityByID(community_id)
    const communityData = communityRef.data()
    setCommunity(communityData)
    setData(dataToUpdate)
  }

  useEffect(() => {
    if (dataToUpdate) {
      setCurrentData()
    } else {
      setData(initialData)
    }
  }, [dataToUpdate])

  const changeHandler = (field: Field, value: string | boolean) => {
    const newData = { ...data }
    if (
      field === 'status' &&
      (value === 'active' || value === 'suspended' || value === 'pending' || value === 'locked')
    ) {
      newData.status = value
    } else if (
      (field === 'email' ||
        field === 'first_name' ||
        field === 'last_name' ||
        field === 'display_name' ||
        field === 'profile_photo' ||
        field === 'street') &&
      typeof value === 'string'
    ) {
      newData[field] = value
    } else if (field === 'is_admin' && typeof value === 'boolean') {
      newData.is_admin = value
    }
    setData(newData)
  }

  const onSave = async () => {
    if (API_URL && firebaseToken) {
      let url = `${API_URL}/users`
      let method = 'POST'
      if (mode === 'update' && dataToUpdate.id) {
        url = `${url}/${dataToUpdate.id}`
        method = 'PUT'
        delete data.email
      }
      let res = await (
        await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${firebaseToken}`,
          },
          method,
          body: JSON.stringify({ ...data, source: 'cms' }),
        })
      ).json()
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

  if (!WrapperComponent) return null

  return (
    <WrapperComponent isOpen={isOpen}>
      <div className="flex justify-between mb-3">
        <Dropdown
          name="status"
          simpleOptions={['active', 'suspended', 'pending', 'locked']}
          currentValue={data.status}
          size="small"
          onSelect={(option) => changeHandler('status', option.value as string)}
          buttonColor={statusColorMap[data.status || 'enabled']}
        />
        <Checkbox
          label="Admin"
          onChange={(e) => changeHandler('is_admin', e.target.checked)}
          noMargin
          value={data.is_admin || false}
        />
      </div>
      <DynamicForm
        fields={fields}
        formClassName="grid grid-cols-2 gap-5"
        className="gap-y-5"
        cancelLabel="Close"
      />
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

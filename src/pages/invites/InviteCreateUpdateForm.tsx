import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Button } from '../../components/buttons'
import Dropdown from '../../components/Dropdown'
import { Checkbox, TextField } from '../../components/inputs'
import Modal from '../../components/modals'
import { API_URL } from '../../config/variables'
import { useAuth } from '../../contexts/AuthContext'
import { Invite } from '../../models'
import { CreateUpdateFormProps, statusColorMap } from '../../utils/types'
const humanPassword = require('human-password')

type Response = {
  status?: string
  data?: Invite
  message?: string
  error_fields?: Field[]
}

type InviteFormType = {
  id?: string
  status?: 'enabled' | 'disabled'
  claimed?: boolean
  email?: string
  user_id?: string
  code?: string
}

type Field = 'status' | 'claimed' | 'email' | 'user_id' | 'code'

const initialData: InviteFormType = {}

const InviteCreateUpdateForm = ({
  isOpen = false,
  setIsOpen,
  mode = 'create',
  dataToUpdate,
  isModal = true,
}: CreateUpdateFormProps) => {
  const history = useHistory()
  const [data, setData] = useState<InviteFormType>(dataToUpdate || initialData)
  const [responseData, setResponseData] = useState<Response>({})
  const { currentUserInfo, firebaseToken } = useAuth()

  useEffect(() => {
    if (mode === 'create') {
      const code = humanPassword({ couples: 3, digits: 3 })
      const newData = { ...initialData, code, user_id: currentUserInfo?.id }

      setTimeout(() => {
        setData(newData)
      }, 100)
    }
  }, [])

  useEffect(() => {
    if (dataToUpdate) {
      setData(dataToUpdate)
    } else {
      setData(initialData)
    }
  }, [dataToUpdate])

  const changeHandler = (field: Field, value: string | boolean) => {
    const newData = { ...data }
    if (field === 'status' && (value === 'enabled' || value === 'disabled')) {
      newData.status = value
    } else if (
      (field === 'email' || field === 'user_id' || field === 'code') &&
      typeof value === 'string'
    ) {
      newData[field] = value
    } else if (field === 'claimed' && typeof value === 'boolean') {
      newData[field] = value
    }
    setData(newData)
  }

  const onSave = async () => {
    if (API_URL && firebaseToken) {
      let url = `${API_URL}/invite`
      let method = 'POST'
      if (mode === 'update' && data.id) {
        url = `${url}/${data.id}`
        method = 'PUT'
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
          history.push('/invite')
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

  return (
    <Modal title={`${mode} Invite`} isOpen={isOpen} setIsOpen={setIsOpen} onSave={onSave}>
      {mode === 'update' && (
        <div className="flex justify-between mb-3">
          <Dropdown
            name="Status"
            simpleOptions={['enabled', 'disabled']}
            currentValue={data.status}
            size="small"
            onSelect={(option) => changeHandler('status', option.value as string)}
            buttonColor={statusColorMap[data.status || 'enabled']}
          />
          <Checkbox
            label="Claimed"
            onChange={(e) => changeHandler('claimed', e.target.checked)}
            noMargin
            value={data.claimed || false}
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-2">
        <TextField
          required
          label="invitee email"
          type="email"
          size="small"
          onChange={(e) => changeHandler('email', e.target.value)}
          isError={fieldIsError('email')}
          value={data.email}
        />
        <TextField
          required
          label="inviter"
          type="text"
          size="small"
          onChange={(e) => changeHandler('user_id', e.target.value)}
          isError={fieldIsError('user_id')}
          value={data.user_id}
          readOnly={mode === 'update'}
        />
        <TextField
          required
          label="code"
          type="text"
          size="small"
          onChange={(e) => changeHandler('code', e.target.value)}
          isError={fieldIsError('code')}
          value={data.code}
          readOnly={mode === 'update'}
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
            Invite
          </Button>
        </div>
      )}
    </Modal>
  )
}

export default InviteCreateUpdateForm

import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Button } from '../../components/buttons'
import Dropdown from '../../components/Dropdown'
import { Checkbox, TextField } from '../../components/inputs'
import Modal from '../../components/modals'
import { useAuth } from '../../contexts/AuthContext'
import { statusColorMap } from '../../utils/types'
const humanPassword = require('human-password')

type Props = {
  isOpen?: boolean
  setIsOpen: (val: boolean) => void
  mode?: 'create' | 'update'
  inviteToUpdate?: any
  isModal?: boolean
}

const initialData = {}

const InviteCreateUpdateForm = ({
  isOpen = false,
  setIsOpen,
  mode = 'create',
  inviteToUpdate,
  isModal = true,
}: Props) => {
  const history = useHistory()
  const [data, setData] = useState<any>(inviteToUpdate || initialData)
  const [responseData, setResponseData] = useState<any>({})
  const { currentUserInfo } = useAuth()

  useEffect(() => {
    if (mode === 'create') {
      const code = humanPassword({ couples: 3, digits: 3 })
      const newData = { ...initialData, code, user_id: currentUserInfo.id }

      setTimeout(() => {
        setData(newData)
      }, 100);
    }
  }, [])

  useEffect(() => {
    if (inviteToUpdate) {
      setData(inviteToUpdate)
    } else {
      setData(initialData)
    }
  }, [inviteToUpdate])

  const changeHandler = (field: string, value: string | number | boolean | null) => {
    const newData = { ...data }
    newData[field] = value
    setData(newData)
  }

  const onSave = async () => {
    console.log('data', data)
    if (process.env.REACT_APP_API_URL) {
      let url = `${process.env.REACT_APP_API_URL}/invite`
      let method = 'POST'
      if (mode === 'update' && data.id) {
        url = `${url}/${data.id}`
        method = 'PUT'
      }
      let res: any = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
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
          history.push('/invite')
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
    <Modal title={`${mode} Invite`} isOpen={isOpen} setIsOpen={setIsOpen} onSave={onSave}>
      {mode === 'update' && (
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
        />
        <TextField
          required
          label="code"
          type="text"
          size="small"
          onChange={(e) => changeHandler('code', e.target.value)}
          isError={fieldIsError('code')}
          value={data.code}
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

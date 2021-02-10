import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Button } from '../../components/buttons'
import { TextField } from '../../components/inputs'
import Modal from '../../components/modals'

type Props = {
  isOpen?: boolean
  setIsOpen?: (val: boolean) => void
  mode?: 'create' | 'update'
  communityToUpdate?: any
  isModal?: boolean
}

const initialData = {}

const CommunityCreateUpdateForm = ({
  isOpen = false,
  setIsOpen,
  mode = 'create',
  communityToUpdate,
  isModal = true,
}: Props) => {
  const history = useHistory()
  const [data, setData] = useState<any>(communityToUpdate || initialData)
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
  }, [isModal, communityToUpdate, setIsOpen, isOpen, mode])

  useEffect(() => {
    if (communityToUpdate) {
      setData(communityToUpdate)
    } else {
      setData(initialData)
    }
  }, [communityToUpdate])

  const changeHandler = (field: string, value: string | number | boolean | null) => {
    const newData = { ...data }
    newData[field] = value
    setData(newData)
  }

  const onSave = async () => {
    console.log('data', data)
    if (process.env.REACT_APP_API_URL) {
      let url = `${process.env.REACT_APP_API_URL}/community`
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
          history.push('/communities')
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
    <WrapperComponent
      title={`${mode} community`}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onSave={onSave}
    >
      <div className="grid grid-cols-2 gap-x-2">
        <TextField
          required
          label="name"
          type="name"
          size="small"
          onChange={(e) => changeHandler('name', e.target.value)}
          isError={fieldIsError('name')}
          defaultValue={data.name}
        />
        <TextField
          required
          label="subdivision"
          type="subdivision"
          size="small"
          onChange={(e) => changeHandler('subdivision', e.target.value)}
          isError={fieldIsError('subdivision')}
          defaultValue={data.subdivision}
        />
        <TextField
          required
          label="city"
          type="city"
          size="small"
          onChange={(e) => changeHandler('city', e.target.value)}
          isError={fieldIsError('city')}
          defaultValue={data.city}
        />
        <TextField
          required
          label="barangay"
          type="barangay"
          size="small"
          onChange={(e) => changeHandler('barangay', e.target.value)}
          isError={fieldIsError('barangay')}
          defaultValue={data.barangay}
        />
        <TextField
          required
          label="state"
          type="state"
          size="small"
          onChange={(e) => changeHandler('state', e.target.value)}
          isError={fieldIsError('state')}
          defaultValue={data.state}
        />
        <TextField
          required
          label="country"
          type="country"
          size="small"
          onChange={(e) => changeHandler('country', e.target.value)}
          isError={fieldIsError('country')}
          defaultValue={data.country}
        />
        <TextField
          required
          label="zip_code"
          type="zip_code"
          size="small"
          onChange={(e) => changeHandler('zip_code', e.target.value)}
          isError={fieldIsError('zip_code')}
          defaultValue={data.zip_code}
        />
        <TextField
          label="cover_photo"
          type="cover_photo"
          size="small"
          onChange={(e) => changeHandler('cover_photo', e.target.value)}
          isError={fieldIsError('cover_photo')}
          defaultValue={data.cover_photo}
        />
        <TextField
          label="profile_photo"
          type="profile_photo"
          size="small"
          onChange={(e) => changeHandler('profile_photo', e.target.value)}
          isError={fieldIsError('profile_photo')}
          defaultValue={data.profile_photo}
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

export default CommunityCreateUpdateForm

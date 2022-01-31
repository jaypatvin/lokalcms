import React, { ChangeEventHandler, useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Button } from '../../components/buttons'
import Dropdown from '../../components/Dropdown'
import { Checkbox, TextField } from '../../components/inputs'
import Modal from '../../components/modals'
import { API_URL } from '../../config/variables'
import { CreateUpdateFormProps, statusColorMap } from '../../utils/types'
import { useAuth } from '../../contexts/AuthContext'
import useOuterClick from '../../customHooks/useOuterClick'
import { fetchCommunityByID, getCommunities } from '../../services/community'
import { Community, User } from '../../models'

type Response = {
  status?: string
  data?: User
  message?: string
  error_fields?: Field[]
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

const initialData: UserFormType = { status: 'active' }

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
  const [communitySearchText, setCommunitySearchText] = useState('')
  const [communitySearchResult, setCommunitySearchResult] = useState<
    (Community & { id: string })[]
  >([])
  const [showCommunitySearchResult, setShowCommunitySearchResult] = useState(false)
  const communitySearchResultRef = useOuterClick(() => setShowCommunitySearchResult(false))

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
  }, [isModal, dataToUpdate, setIsOpen, isOpen, mode, community])

  const setCurrentData = async () => {
    const { community_id } = dataToUpdate
    const communityRef = await fetchCommunityByID(community_id)
    const communityData = communityRef.data()
    setCommunity(communityData)
    if (communityData) {
      setCommunitySearchText(communityData.name)
    }
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

  const communitySearchHandler: ChangeEventHandler<HTMLInputElement> = async (e) => {
    if (e.target.value.length > 2) {
      const communitiesRef = getCommunities({ search: e.target.value })
      const result = await communitiesRef.get()
      let communities = result.docs.map((doc) => {
        const data = doc.data()
        return { ...data, id: doc.id }
      })
      setCommunitySearchResult(communities)
      setShowCommunitySearchResult(communities.length > 0)
    } else {
      setShowCommunitySearchResult(false)
      setCommunitySearchResult([])
    }
    setCommunitySearchText(e.target.value)
  }

  const communitySelectHandler = (community: Community & { id: string }) => {
    const newData = { ...data, community_id: community.id }
    setShowCommunitySearchResult(false)
    setData(newData)
    setCommunity(community)
    setCommunitySearchText(community.name)
  }

  const onSave = async () => {
    if (API_URL && firebaseToken) {
      let url = `${API_URL}/users`
      let method = 'POST'
      if (mode === 'update' && dataToUpdate.id) {
        url = `${url}/${dataToUpdate.id}`
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
          history.push('/users')
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

  if (!WrapperComponent) return null

  return (
    <WrapperComponent title={`${mode} user`} isOpen={isOpen} setIsOpen={setIsOpen} onSave={onSave}>
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
        <div className="w-64">
          <div ref={communitySearchResultRef} className="relative">
            <TextField
              label="community"
              type="text"
              size="small"
              placeholder="Search"
              onChange={communitySearchHandler}
              defaultValue={communitySearchText}
              onFocus={() => setShowCommunitySearchResult(communitySearchResult.length > 0)}
            />
            {showCommunitySearchResult && communitySearchResult.length > 0 && (
              <div className="absolute bottom-full left-0 w-64 bg-white shadow z-10">
                {communitySearchResult.map((community) => (
                  <button
                    className="w-full p-1 hover:bg-gray-200 block text-left"
                    key={community.id}
                    onClick={() => communitySelectHandler(community)}
                  >
                    {community.name}
                    <span className="block text-xs text-gray-500">
                      {community.address.subdivision}, {community.address.barangay},{' '}
                      {community.address.city}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
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

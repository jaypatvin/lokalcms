import React, { ChangeEventHandler, useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Button } from '../../components/buttons'
import { TextField } from '../../components/inputs'
import Modal from '../../components/modals'
import { fetchUserByID, getUsers } from '../../services/users'
import useOuterClick from '../../customHooks/useOuterClick'

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
  const [userSearchText, setUserSearchText] = useState('')
  const [userSearchResult, setUserSearchResult] = useState<any>([])
  const [showUserSearchResult, setShowUserSearchResult] = useState(false)
  const [admins, setAdmins] = useState<any[]>([])
  const userSearchResultRef = useOuterClick(() => setShowUserSearchResult(false))

  useEffect(() => {
    if (isModal && setIsOpen) {
      const Component = ({ children, isOpen, setIsOpen, onSave }: any) => (
        <Modal title={`${mode} Community`} isOpen={isOpen} setIsOpen={setIsOpen} onSave={onSave}>
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

  useEffect(() => {
    if (
      !isModal &&
      communityToUpdate &&
      communityToUpdate.admin &&
      communityToUpdate.admin.length
    ) {
      const getAdminUsers = async () => {
        const fetchedAdmins = []
        for (let i = 0; i < communityToUpdate.admin.length; i++) {
          const userId = communityToUpdate.admin[i]
          const user = await fetchUserByID(userId)
          if (user) fetchedAdmins.push({ id: user.id, ...user.data() })
        }
        return fetchedAdmins
      }

      getAdminUsers().then((data) => {
        setAdmins(data)
      })
    }
  }, [])

  const changeHandler = (field: string, value: string | number | boolean | null) => {
    const newData = { ...data }
    newData[field] = value
    setData(newData)
  }

  const userSearchHandler: ChangeEventHandler<HTMLInputElement> = async (e) => {
    if (e.target.value.length > 2) {
      const usersRef = getUsers({ search: e.target.value, community: communityToUpdate.id })
      const result = await usersRef.get()
      let users = result.docs.map((doc) => {
        const data = doc.data()
        return { ...data, id: doc.id }
      })
      users = users.filter((user) => !admins.some((admin: any) => admin.id === user.id))
      setUserSearchResult(users)
      setShowUserSearchResult(users.length > 0)
    } else {
      setShowUserSearchResult(false)
      setUserSearchResult([])
    }
    setUserSearchText(e.target.value)
  }

  const userSelectHandler = (user: any) => {
    let newAdmins = [...admins]
    if (admins.some((admin) => admin.id === user.id)) {
      newAdmins = admins.filter((admin) => admin.id !== user.id)
    } else {
      newAdmins.push(user)
    }
    newAdmins.sort((a, b) => (a.display_name.toLowerCase() < b.display_name.toLowerCase() ? -1 : 1))
    setAdmins(newAdmins)
    const newData = { ...data, admin: newAdmins.map(admin => admin.id) }
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
          type="text"
          size="small"
          onChange={(e) => changeHandler('name', e.target.value)}
          isError={fieldIsError('name')}
          defaultValue={data.name}
        />
        <TextField
          label="cover_photo"
          type="text"
          size="small"
          onChange={(e) => changeHandler('cover_photo', e.target.value)}
          isError={fieldIsError('cover_photo')}
          defaultValue={data.cover_photo}
        />
        <TextField
          label="profile_photo"
          type="text"
          size="small"
          onChange={(e) => changeHandler('profile_photo', e.target.value)}
          isError={fieldIsError('profile_photo')}
          defaultValue={data.profile_photo}
        />
        <TextField
          required
          label="subdivision"
          type="text"
          size="small"
          onChange={(e) => changeHandler('subdivision', e.target.value)}
          isError={fieldIsError('subdivision')}
          defaultValue={data.subdivision}
        />
        <TextField
          required
          label="city"
          type="text"
          size="small"
          onChange={(e) => changeHandler('city', e.target.value)}
          isError={fieldIsError('city')}
          defaultValue={data.city}
        />
        <TextField
          required
          label="barangay"
          type="text"
          size="small"
          onChange={(e) => changeHandler('barangay', e.target.value)}
          isError={fieldIsError('barangay')}
          defaultValue={data.barangay}
        />
        <TextField
          required
          label="state"
          type="text"
          size="small"
          onChange={(e) => changeHandler('state', e.target.value)}
          isError={fieldIsError('state')}
          defaultValue={data.state}
        />
        <TextField
          required
          label="country"
          type="text"
          size="small"
          onChange={(e) => changeHandler('country', e.target.value)}
          isError={fieldIsError('country')}
          defaultValue={data.country}
        />
        <TextField
          required
          label="zip_code"
          type="text"
          size="small"
          onChange={(e) => changeHandler('zip_code', e.target.value)}
          isError={fieldIsError('zip_code')}
          defaultValue={data.zip_code}
        />
      </div>
      {!isModal && (
        // TODO: make this generic / reusable
        <div className="w-64">
          <div ref={userSearchResultRef} className="relative">
            <TextField
              label="admins"
              type="text"
              size="small"
              placeholder="Search"
              onChange={userSearchHandler}
              defaultValue={userSearchText}
              onFocus={() => setShowUserSearchResult(userSearchResult.length > 0)}
            />
            {showUserSearchResult && userSearchResult.length > 0 && (
              <div className="absolute top-full left-0 w-72 bg-white shadow z-10">
                {userSearchResult
                  .filter((user: any) => !admins.some((admin: any) => admin.id === user.id))
                  .map((user: any) => (
                    <button
                      className="w-full p-1 hover:bg-gray-200 block text-left"
                      key={user.id}
                      onClick={() => userSelectHandler(user)}
                    >
                      {user.display_name}
                      {user.display_name !== `${user.first_name} ${user.last_name}` ? (
                        <span className="block text-xs text-gray-500">{`${user.first_name} ${user.last_name}`}</span>
                      ) : (
                        ''
                      )}
                      <span className="block text-xs text-gray-500">{user.email}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
          <div className="shadow-inner bg-gray-50 rounded">
            {admins.map((user: any) => (
              <p className="p-1 text-right relative" key={user.id}>
                {user.display_name}
                {user.display_name !== `${user.first_name} ${user.last_name}` ? (
                  <span className="block text-xs text-gray-500">{`${user.first_name} ${user.last_name}`}</span>
                ) : (
                  ''
                )}
                <span className="block text-xs text-gray-500">{user.email}</span>
                <button
                  className="text-red-600 absolute left-full top-1/3 ml-1"
                  onClick={() => userSelectHandler(user)}
                >
                  remove
                </button>
              </p>
            ))}
          </div>
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
    </WrapperComponent>
  )
}

export default CommunityCreateUpdateForm

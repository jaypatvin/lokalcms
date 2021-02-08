import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { fetchUserByID } from '../../services/users'
import UserCreateUpdateForm from './UserCreateUpdateForm'

type Props = {
  useCurrentUser?: boolean
  [x: string]: any
}

const UserEditPage = ({ match }: Props) => {
  const { currentUserInfo } = useAuth()
  const [user, setUser] = useState<any>()

  const normalizeUserData = (data: any) => {
    return {
      status: data.status,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      display_name: data.display_name,
      community_id: data.community_id,
      profile_photo: data.profile_photo,
      street: data.address.street,
      is_admin: data.roles.admin,
    }
  }

  const fetchUser = async (id: string) => {
    const userRef: any = await fetchUserByID(id)
    let userToEdit = userRef.data()
    userToEdit = { ...normalizeUserData(userToEdit), id }
    setUser(userToEdit)
  }

  useEffect(() => {
    if (match.path === '/myaccount') {
      const userData = { ...normalizeUserData(currentUserInfo), id: currentUserInfo.id }
      setUser(userData)
    } else if (match.path === '/users/:id') {
      fetchUser(match.params.id)
    }
  }, [match.path])

  console.log('user', user)

  return (
    <div className="container">
      {user && (
        <>
          <h3>User Edit: {user.display_name || `${user.first_name} ${user.last_name}`}</h3>
          <UserCreateUpdateForm userToUpdate={user} isModal={false} mode="update" />
        </>
      )}
    </div>
  )
}

export default UserEditPage

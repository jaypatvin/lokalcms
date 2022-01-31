import React, { useEffect, useState } from 'react'
import { User } from '../../models'
import { fetchUserByID } from '../../services/users'
import UserCreateUpdateForm from './UserCreateUpdateForm'

type Props = {
  useCurrentUser?: boolean
  [x: string]: any
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

const UserEditPage = ({ match }: Props) => {
  const [user, setUser] = useState<UserFormType>()

  const normalizeUserData = (data: User) => {
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
    const userRef = await fetchUserByID(id)
    const userToEdit = userRef.data()
    if (userToEdit) {
      setUser({ ...normalizeUserData(userToEdit), id })
    }
  }

  useEffect(() => {
    fetchUser(match.params.id)
  }, [match.params])

  return (
    <div className="container">
      {user && (
        <>
          <h3>User Edit: {user.display_name || `${user.first_name} ${user.last_name}`}</h3>
          <UserCreateUpdateForm dataToUpdate={user} isModal={false} mode="update" />
        </>
      )}
    </div>
  )
}

export default UserEditPage

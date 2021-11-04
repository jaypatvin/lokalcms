import React, { useEffect, useState } from 'react'
import { fetchUserByID } from '../../services/users'
import UserCreateUpdateForm from './UserCreateUpdateForm'

type Props = {
  useCurrentUser?: boolean
  [x: string]: any
}

const UserEditPage = ({ match }: Props) => {
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

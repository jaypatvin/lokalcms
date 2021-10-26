import React, { useEffect, useState } from 'react'
import { fetchUserByID } from '../../services/users'

type Props = {
  [x: string]: any
}

const ProfilePage = ({ match }: Props) => {
  const [user, setUser] = useState<any>({})

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
    let userData = userRef.data()
    userData = { ...normalizeUserData(userData), id }
    setUser(userData)
  }

  useEffect(() => {
    fetchUser(match.params.id)
  }, [match.params])

  return <h3>{user.display_name}</h3>
}

export default ProfilePage

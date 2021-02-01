import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

type Props = {
  useCurrentUser?: boolean
  [x: string]: any
}

const UserEditPage = ({ useCurrentUser }: Props) => {
  const { currentUser, currentUserInfo } = useAuth()

  // TODO: complete
  let displayName = 'None'
  if (useCurrentUser) {
    displayName = currentUserInfo.display_name
  }

  return (
    <div>
      <h3>User Edit: {displayName}</h3>
    </div>
  )
}

export default UserEditPage

import React from 'react'
import { useAuth } from "../../contexts/AuthContext"

const UserEditPage = (props) => {
  const { useCurrentUser } = props

  const { currentUser, currentUserInfo } = useAuth()

  // TODO: complete
  let displayName = "None"
  if (useCurrentUser) {
    displayName = currentUserInfo.display_name
  }

  console.log(props)
 
  return (
    <div>
      <h3>User Edit: {displayName}</h3>
    </div>
  );

};

export default UserEditPage;
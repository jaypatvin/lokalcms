import React from 'react'
import { Redirect } from 'react-router-dom'

import { useAuth } from "../contexts/AuthContext"

const LogoutPage = (props) => {
  const { currentUser, logout, setRedirect } = useAuth()

  if (currentUser !== null) {
      logout()
      setRedirect('/login')
  }

  return (
    <Redirect to="/login" />
  )
}

export default LogoutPage

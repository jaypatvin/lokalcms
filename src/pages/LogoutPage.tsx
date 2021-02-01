import React from 'react'
import { Redirect } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'

const LogoutPage = (props: any) => {
  const { currentUser, logout, setRedirect } = useAuth()

  if (currentUser) {
    if (logout) logout()
    if (setRedirect) setRedirect('/login')
  }

  return <Redirect to="/login" />
}

export default LogoutPage

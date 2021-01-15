import React, { useContext, useState, useEffect } from 'react'
import ReactLoading from 'react-loading'

import { auth } from '../services/firebase'
import { fetchUserByUID } from '../services/users'

const AuthContext = React.createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState()
  const [currentUserInfo, setCurrentUserInfo] = useState()
  const [withError, setWithError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [redirect, setRedirect] = useState('')
  const [loading, setLoading] = useState(true)

  function signup(email, password) {
    return auth.createUserWithEmailAndPassword(email, password)
  }

  function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password)
  }

  function logout() {
    return auth.signOut()
  }

  function resetPassword(email) {
    return auth.sendPasswordResetEmail(email)
  }

  function updateEmail(email) {
    return currentUser.updateEmail(email)
  }

  function updatePassword(password) {
    return currentUser.updatePassword(password)
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user)
      
      if (user !== null) {

        const userInfo = await fetchUserByUID(user.uid)
        if (userInfo === false) {
          // if user is not mapped to the users collection
          // log out the user
          setCurrentUserInfo(null)
          setWithError(true)
          setErrorMsg('User does not exist or not mapped.')
          // logout
          await logout()
        } else {
          setCurrentUserInfo(userInfo)
        }

        if (redirect.length > 0) {
          if (typeof window !== 'undefined') {
            const _redirect = redirect
            setRedirect('')
            window.location.href = _redirect;
          }
        }

      }

      setLoading(false)
      
    })

    return unsubscribe
  }, [redirect, errorMsg, withError])

  const value = {
    currentUser,
    currentUserInfo,
    login,
    signup,
    logout,
    resetPassword,
    updateEmail,
    updatePassword,
    setRedirect,
    redirect,
    withError,
    errorMsg
  }

  if (loading) {
    return (<ReactLoading width={75} height={75} type='spin' color='#81e6d9' className='mx-auto my-auto'/>);
  } else {
    return (<AuthContext.Provider value={value}>{children}</AuthContext.Provider>)
  }

  

}

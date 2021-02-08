import React, { useContext, useState, useEffect, createContext, ReactNode } from 'react'
import ReactLoading from 'react-loading'

import { auth } from '../services/firebase'
import { fetchUserByUID } from '../services/users'

type ContextType = {
  currentUser?: any
  currentUserInfo?: any
  login?: (email: string, password: string) => void
  logout?: () => void
  withError?: boolean
  errorMsg?: string
  setRedirect?: (s: string) => void
}

const AuthContext = createContext<ContextType>({})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>()
  const [currentUserInfo, setCurrentUserInfo] = useState<any>()
  const [withError, setWithError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [redirect, setRedirect] = useState('')
  const [loading, setLoading] = useState(true)

  function signup(email: string, password: string) {
    return auth.createUserWithEmailAndPassword(email, password)
  }

  function login(email: string, password: string) {
    return auth.signInWithEmailAndPassword(email, password)
  }

  function logout() {
    return auth.signOut()
  }

  function resetPassword(email: string) {
    return auth.sendPasswordResetEmail(email)
  }

  function updateEmail(email: string) {
    return currentUser.updateEmail(email)
  }

  function updatePassword(password: string) {
    return currentUser.updatePassword(password)
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user)

      if (user !== null) {
        const userRef = await fetchUserByUID(user.uid)
        if (userRef === false) {
          // if user is not mapped to the users collection
          // log out the user
          setCurrentUserInfo(null)
          setWithError(true)
          setErrorMsg('User does not exist or not mapped.')
          // logout
          await logout()
        } else {
          const userInfo = { ...userRef.data(), id: userRef.id }
          setCurrentUserInfo(userInfo)
        }

        if (redirect.length > 0) {
          if (typeof window !== 'undefined') {
            const _redirect = redirect
            setRedirect('')
            window.location.href = _redirect
          }
        }
      }

      setLoading(false)
    })

    return unsubscribe
  }, [redirect, errorMsg, withError, loading])

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
    errorMsg,
  }

  if (loading) {
    return (
      <ReactLoading
        width={75}
        height={75}
        type="spin"
        color="#81e6d9"
        className="mx-auto my-auto"
      />
    )
  } else {
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  }
}

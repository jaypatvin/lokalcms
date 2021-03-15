import React, { useContext, useState, useEffect, createContext, ReactNode } from 'react'
import ReactLoading from 'react-loading'

import { auth, firebase } from '../services/firebase'
import { fetchUserByUID } from '../services/users'

type ContextType = {
  currentUser?: firebase.User
  currentUserInfo?: any
  login?: (email: string, password: string) => Promise<firebase.auth.UserCredential>
  logout?: () => void
  reauthenticate?: (email: string, password: string) => Promise<any>
  withError?: boolean
  errorMsg?: string
  setRedirect?: (s: string) => void
  firebaseToken?: string
}

const AuthContext = createContext<ContextType>({})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<firebase.User>()
  const [currentUserInfo, setCurrentUserInfo] = useState<any>()
  const [withError, setWithError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [redirect, setRedirect] = useState('')
  const [loading, setLoading] = useState(true)
  const [firebaseToken, setFirebaseToken] = useState<string>()

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
    if (currentUser) return currentUser.updateEmail(email)
  }

  function updatePassword(password: string) {
    if (currentUser) return currentUser.updatePassword(password)
  }

  function reauthenticate(email: string, password: string) {
    if (currentUser) {
      const credential = firebase.auth.EmailAuthProvider.credential(currentUserInfo.email, password)

      return currentUser.reauthenticateWithCredential(credential)
    }
    return new Promise((resolve, reject) =>
      reject({ status: 'error', message: 'Current user does not exist' })
    )
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user !== null) {
        setCurrentUser(user)
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
          const token = await user.getIdToken()
          console.log('token', token)
          const userInfo = { ...userRef.data(), id: userRef.id }
          setFirebaseToken(token)
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
    reauthenticate,
    setRedirect,
    redirect,
    withError,
    errorMsg,
    firebaseToken,
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

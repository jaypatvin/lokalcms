import React, { useState, useEffect, useContext } from 'react'
import ReactLoading from 'react-loading'
import { auth } from '../services/firebase';

export const CurrentUserContext = React.createContext()

export const useCurrentUser = () => {
  return useContext(CurrentUserContext).currentUser
}

export const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [pending, setPending] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user)
      setPending(false)
    })

    return unsubscribe
  }, [])

  async function getCurrentUser() {
    var user = await auth.currentUser;
    console.log(user);
    if (user) {
      console.log('getCurrentUser: - 1');
      setCurrentUser(user)
    } else {
      setCurrentUser(null)
    }
  }

  const authStore = {
    currentUser,
    setCurrentUser,
    getCurrentUser,
  }

  if (pending) {
    return (<ReactLoading width={75} height={75} type='spin' color='#81e6d9' className='mx-auto my-auto'/>);
  }

  return <CurrentUserContext.Provider value={authStore}>{children}</CurrentUserContext.Provider>
}

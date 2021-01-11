import React, { useState, useEffect, useContext } from 'react'
import { auth } from '../services/firebase';

export const CurrentUserContext = React.createContext()

export const useCurrentUser = () => {
  return useContext(CurrentUserContext).currentUser
}

export const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [pending, setPending] = useState(true);

  // Check if user logged in or not
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setCurrentUser(user)
      setPending(false)
    });
  }, [])

  async function getCurrentUser() {
    var user = await auth.currentUser;

    if (user) {
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

  if(pending) {
    return ( <div>Loading...</div> )
  }

  return <CurrentUserContext.Provider value={authStore}>{children}</CurrentUserContext.Provider>
}

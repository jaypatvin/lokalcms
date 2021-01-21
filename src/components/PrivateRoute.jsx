import React, { useState } from 'react'
import { Redirect, Route } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'

import { useAuth } from "../contexts/AuthContext"
import BasePage from "./BasePage"
import SideNav from './SideNav'

const PrivateRoute = ({ component: RouteComponent, redirect: RedirectPath, ...rest }) => {
  const { currentUser } = useAuth()
  const [isClosed, setClosed] = useState(false)


  console.log('PrivateRoute:', currentUser);

  return (
    <Route
      {...rest}
      render={props => {
        return (currentUser !== null ? ( RedirectPath ? <Redirect to={RedirectPath} /> :
          (
          <BasePage>
            <RouteComponent {...props} {...rest} />
          </BasePage>
          )) : <Redirect to="/login" />)
      }}
    />
  )
}

export default PrivateRoute

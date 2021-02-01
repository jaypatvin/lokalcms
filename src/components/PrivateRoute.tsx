import React, { FC } from 'react'
import { Redirect, Route } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'
import BasePage from './BasePage'

type Props = {
  component?: FC
  redirect?: string
  [x: string]: any
}

const PrivateRoute = ({ component: RouteComponent, redirect: RedirectPath, ...rest }: Props) => {
  const { currentUser } = useAuth()

  console.log('PrivateRoute:', currentUser)

  const renderPage = (props: any) => {
    if (currentUser !== null) {
      if (RedirectPath) return <Redirect to={RedirectPath} />
      if (RouteComponent)
        return (
          <BasePage>
            <RouteComponent {...props} {...rest} />
          </BasePage>
        )
    }
    return <Redirect to="/login" />
  }

  return <Route {...rest} render={renderPage} />
}

export default PrivateRoute

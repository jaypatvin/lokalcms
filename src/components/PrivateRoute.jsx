import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import { useAuth } from "../contexts/AuthContext"
import SideNav from './SideNav'

const PrivateRoute = ({ component: RouteComponent, ...rest }) => {
  const { currentUser } = useAuth()

  console.log('PrivateRoute:', currentUser);

  return (
    <Route
      {...rest}
      render={props => {
        return (currentUser !== null ? 
          (<div className="flex row w-screen bg-gray-100 bg-no-repeat bg-top">
          <div className="bg-white" style={{ width: 400, boxShadow: '2px 0 10px rgba(0,0,0,0.05)' }}>
            <SideNav />
          </div>
          <div className="p-6 w-full min-h-screen relative"><RouteComponent {...props} /></div>
        </div>)
           
          : 
          <Redirect to="/login" />)
      }}
    />
  )
}

export default PrivateRoute

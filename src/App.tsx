import React from 'react'
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom'

import { AuthProvider, useAuth } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'

import LoginPage from './pages/LoginPage'
import LogoutPage from './pages/LogoutPage'
import DashboardPage from './pages/DashboardPage'
import TestPage from './pages/TestPage'

// Pages
import CommunityListPage from './pages/communities/CommunityListPage'
import CommunityEditPage from './pages/communities/CommunityEditPage'
import ShopListPage from './pages/shops/ShopListPage'
import UserListPage from './pages/users/UserListPage'
import InviteListPage from './pages/invites/InviteListPage'
import SettingsPage from './pages/settings/SettingsPage'

// User Edit for MyAccount
import UserEditPage from './pages/users/UserEditPage'

class App extends React.Component {
  render() {
    return (
      <AuthProvider>
        <Router>
          <Switch>
            <Route exact path="/login" component={LoginPage} />
            <Route exact path="/logout" component={LogoutPage} />
            <Route exact path="/test" component={TestPage} />
            <PrivateRoute exact path="/" redirect="/dashboard" />
            <PrivateRoute exact path="/dashboard" component={DashboardPage} />
            <PrivateRoute exact path="/communities" component={CommunityListPage} />
            <PrivateRoute exact path="/communities/:id" component={CommunityEditPage} />
            <PrivateRoute exact path="/shops" component={ShopListPage} />
            <PrivateRoute exact path="/users" component={UserListPage} />
            <PrivateRoute exact path="/users/:id" component={UserEditPage} />
            <PrivateRoute exact path="/invites" component={InviteListPage} />
            <PrivateRoute exact path="/settings" component={SettingsPage} />
            <PrivateRoute exact path="/myaccount" component={UserEditPage} useCurrentUser={true} />
          </Switch>
        </Router>
      </AuthProvider>
    )
  }
}

export default App

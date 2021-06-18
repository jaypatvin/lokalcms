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
import ActivityListPage from './pages/activities/ActivityListPage'
import ShopListPage from './pages/shops/ShopListPage'
import ProductListPage from './pages/products/ProductListPage'
import CategoryListPage from './pages/categories/CategoryListPage'
import UserListPage from './pages/users/UserListPage'
import InviteListPage from './pages/invites/InviteListPage'
import SettingsPage from './pages/settings/SettingsPage'
import HistoryListPage from './pages/history/HistoryListPage'

import UserEditPage from './pages/users/UserEditPage'
import DiscoverPage from './pages/discover/DiscoverPage'
import ChatsPage from './pages/chats/ChatsPage'

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
            <PrivateRoute exact path="/activities" component={ActivityListPage} />
            <PrivateRoute exact path="/shops" component={ShopListPage} />
            <PrivateRoute exact path="/products" component={ProductListPage} />
            <PrivateRoute exact path="/categories" component={CategoryListPage} />
            <PrivateRoute exact path="/users" component={UserListPage} />
            <PrivateRoute exact path="/users/:id" component={UserEditPage} />
            <PrivateRoute exact path="/chats" component={ChatsPage} />
            <PrivateRoute exact path="/invites" component={InviteListPage} />
            <PrivateRoute exact path="/settings" component={SettingsPage} />
            <PrivateRoute exact path="/history" component={HistoryListPage} />
            <PrivateRoute exact path="/discover" component={DiscoverPage} />
            <PrivateRoute exact path="/myaccount" component={UserEditPage} useCurrentUser={true} />
          </Switch>
        </Router>
      </AuthProvider>
    )
  }
}

export default App

import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'

import LoginPage from './pages/LoginPage'
import LogoutPage from './pages/LogoutPage'
import TestPage from './pages/TestPage'

// Pages
import DashboardPage from './pages/dashboard/DashboardPage'
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
import OrdersPage from './pages/orders/OrdersPage'
import OrderCreatePage from './pages/orders/OrderCreatePage'
import ProductSubscriptionPlansPage from './pages/productSubscriptionPlans/ProductSubscriptionPlansPage'
import ApplicationLogsPage from './pages/applicationLogs/ApplicationLogsPage'
import ProfilePage from './pages/profile/ProfilePage'
import CommunityPage from './pages/community/CommunityPage'
import ShopPage from './pages/shop/ShopPage'
import ActivityPage from './pages/activity/ActivityPage'
import ReviewListPage from './pages/reviews/ReviewsListPage'
import ReportListPage from './pages/reports/ReportListPage'

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
            <PrivateRoute exact path="/communities/:id" component={CommunityPage} />
            <PrivateRoute exact path="/communities/:id/edit" component={CommunityEditPage} />
            <PrivateRoute exact path="/activities" component={ActivityListPage} />
            <PrivateRoute exact path="/activities/:id" component={ActivityPage} />
            <PrivateRoute exact path="/shops" component={ShopListPage} />
            <PrivateRoute exact path="/shops/:id" component={ShopPage} />
            <PrivateRoute exact path="/products" component={ProductListPage} />
            <PrivateRoute exact path="/reviews" component={ReviewListPage} />
            <PrivateRoute
              exact
              path="/productSubscriptionPlans"
              component={ProductSubscriptionPlansPage}
            />
            <PrivateRoute exact path="/orders" component={OrdersPage} />
            <PrivateRoute exact path="/createOrder" component={OrderCreatePage} />
            <PrivateRoute exact path="/categories" component={CategoryListPage} />
            <PrivateRoute exact path="/users" component={UserListPage} />
            <PrivateRoute exact path="/users/:id" component={ProfilePage} />
            <PrivateRoute exact path="/users/:id/edit" component={UserEditPage} />
            <PrivateRoute exact path="/chats" component={ChatsPage} />
            <PrivateRoute exact path="/invites" component={InviteListPage} />
            <PrivateRoute exact path="/settings" component={SettingsPage} />
            <PrivateRoute exact path="/history" component={HistoryListPage} />
            <PrivateRoute exact path="/applicationLogs" component={ApplicationLogsPage} />
            <PrivateRoute exact path="/discover" component={DiscoverPage} />
            <PrivateRoute exact path="/reports" component={ReportListPage} />
            <PrivateRoute exact path="/myaccount" component={UserEditPage} useCurrentUser={true} />
          </Switch>
        </Router>
      </AuthProvider>
    )
  }
}

export default App

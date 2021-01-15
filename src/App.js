import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'

import PageContainer from './components/PageContainer'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

class App extends React.Component {

  render() {
    return (
      <AuthProvider>
        <Router>
          <Switch>
            <Route exact path="/login" component={LoginPage} />
            <PageContainer>
              <PrivateRoute exact path="/" component={DashboardPage} />
            </PageContainer>
          </Switch>
        </Router>
      </AuthProvider>
      
    )
  }

}

export default App;

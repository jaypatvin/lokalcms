import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import { CurrentUserProvider } from './contexts/CurrentUserContext';
import PrivateRoute from './components/PrivateRoute'

import PageContainer from './components/PageContainer'
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

class App extends React.Component {

  render() {
    return (
      <CurrentUserProvider>
        <Router>
          <Switch>
            <Route exact path="/login" component={LoginPage} />
            <PageContainer>
              <PrivateRoute exact path="/" component={DashboardPage} />
            </PageContainer>
          </Switch>
        </Router>
      </CurrentUserProvider>
      
    )
  }

}

export default App;

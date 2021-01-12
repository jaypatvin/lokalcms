import React, { useContext } from 'react'
import { CurrentUserContext } from '../contexts/CurrentUserContext'

const DashboardPage = (props) => {

  const { currentUser } = useContext(CurrentUserContext)

  console.log(currentUser);
 
  return (
    <div>
      <h3>Dashboard</h3>
    </div>
  );

};

export default DashboardPage;
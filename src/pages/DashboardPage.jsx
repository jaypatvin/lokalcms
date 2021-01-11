import React, { useContext } from 'react'
import { CurrentUserContext } from '../contexts/CurrentUserContext'

const DashboardPage = (props) => {

  const { currentUser } = useContext(CurrentUserContext)

  console.log(currentUser);
 
  return (
    <div>Dashboard</div>
  );

};

export default DashboardPage;
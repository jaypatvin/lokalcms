import React, { useState } from 'react'
import { ConfirmationDialog } from '../../components/Dialog'
import UserListItem from './UserListItem'
import { useAuth } from '../../contexts/AuthContext'

type Props = {
  users: any
  openUpdateUser: (user: any) => void
}

const UserListItems = ({ users, openUpdateUser }: Props) => {
  const { currentUserInfo } = useAuth()
  const [userToDelete, setUserToDelete] = useState<any>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const deleteUser = async (user: any) => {
    if (process.env.REACT_APP_API_URL) {
      const { id, display_name } = user
      let url = `${process.env.REACT_APP_API_URL}/users/${id}`
      let res: any = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'DELETE',
        body: JSON.stringify({ id, display_name }),
      })
      res = await res.json()
      console.log(res)
      setIsDeleteDialogOpen(false)
      setUserToDelete({})
    } else {
      console.error('environment variable for the api does not exist.')
    }
  }

  const deleteClicked = (user: any) => {
    setIsDeleteDialogOpen(true)
    setUserToDelete(user)
  }

  return (
    <>
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onAccept={() => deleteUser(userToDelete)}
        color="danger"
        title="Delete"
        descriptions={`Are you sure you want to delete user ${userToDelete.email}?`}
        acceptLabel="Delete"
        cancelLabel="Cancel"
      />
      {users.map((user: any) => (
        <UserListItem
          key={user.id}
          user={user}
          openUpdateUser={() => openUpdateUser(user)}
          onDeleteUser={() => deleteClicked(user)}
          hideDelete={currentUserInfo.id === user.id}
        />
      ))}
    </>
  )
}

export default UserListItems

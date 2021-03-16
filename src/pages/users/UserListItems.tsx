import React, { useState } from 'react'
import { ConfirmationDialog } from '../../components/Dialog'
import UserListItem from './UserListItem'
import { useAuth } from '../../contexts/AuthContext'
import { API_URL } from '../../config/variables'

type Props = {
  users: any
  openUpdateUser: (user: any) => void
}

const UserListItems = ({ users, openUpdateUser }: Props) => {
  const { currentUserInfo, firebaseToken } = useAuth()
  const [userToDelete, setUserToDelete] = useState<any>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToUnarchive, setUserToUnarchive] = useState<any>({})
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false)

  const deleteUser = async (user: any) => {
    if (API_URL && firebaseToken) {
      const { id } = user
      let url = `${API_URL}/users/${id}`
      let res: any = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firebaseToken}`,
        },
        method: 'DELETE',
      })
      res = await res.json()
      console.log('res', res)
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

  const unarchiveUser = async (user: any) => {
    if (API_URL && firebaseToken) {
      let url = `${API_URL}/users/${user.id}/unarchive`
      let res: any = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firebaseToken}`,
        },
        method: 'PUT'
      })
      res = await res.json()
      console.log('res', res)
      setIsUnarchiveDialogOpen(false)
      setUserToUnarchive({})
    } else {
      console.error('environment variable for the api does not exist.')
    }
  }

  const unarchiveClicked = (user: any) => {
    setIsUnarchiveDialogOpen(true)
    setUserToUnarchive(user)
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
      <ConfirmationDialog
        isOpen={isUnarchiveDialogOpen}
        onClose={() => setIsUnarchiveDialogOpen(false)}
        onAccept={() => unarchiveUser(userToUnarchive)}
        color="primary"
        title="Unarchive"
        descriptions={`Are you sure you want to unarchive user ${userToUnarchive.email}?`}
        acceptLabel="Unarchive"
        cancelLabel="Cancel"
      />
      {users.map((user: any) => (
        <UserListItem
          key={user.id}
          user={user}
          openUpdateUser={() => openUpdateUser(user)}
          onDeleteUser={() => deleteClicked(user)}
          onUnarchiveUser={() => unarchiveClicked(user)}
          hideDelete={currentUserInfo.id === user.id}
          isArchived={user.archived}
        />
      ))}
    </>
  )
}

export default UserListItems

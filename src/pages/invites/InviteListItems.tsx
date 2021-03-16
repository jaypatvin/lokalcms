import React, { useState } from 'react'
import { ConfirmationDialog } from '../../components/Dialog'
import { API_URL } from '../../config/variables'
import InviteListItem from './InviteListItem'
import { useAuth } from '../../contexts/AuthContext'

type Props = {
  invites: any
  openUpdateInvite: (invite: any) => void
}

const InviteListItems = ({ invites, openUpdateInvite }: Props) => {
  const { firebaseToken } = useAuth()
  const [inviteToDelete, setInviteToDelete] = useState<any>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [inviteToUnarchive, setInviteToUnarchive] = useState<any>({})
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false)

  const deleteInvite = async (invite: any) => {
    if (API_URL && firebaseToken) {
      const { id } = invite
      let url = `${API_URL}/invite/${id}`
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
      setInviteToDelete({})
    } else {
      console.error('environment variable for the api does not exist.')
    }
  }

  const deleteClicked = (invite: any) => {
    setIsDeleteDialogOpen(true)
    setInviteToDelete(invite)
  }

  const unarchiveInvite = async (invite: any) => {
    if (API_URL && firebaseToken) {
      let url = `${API_URL}/invite/${invite.id}/unarchive`
      let res: any = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firebaseToken}`,
        },
        method: 'PUT',
      })
      res = await res.json()
      console.log('res', res)
      setIsUnarchiveDialogOpen(false)
      setInviteToUnarchive({})
    } else {
      console.error('environment variable for the api does not exist.')
    }
  }

  const unarchiveClicked = (invite: any) => {
    setIsUnarchiveDialogOpen(true)
    setInviteToUnarchive(invite)
  }

  return (
    <>
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onAccept={() => deleteInvite(inviteToDelete)}
        color="danger"
        title="Delete"
        descriptions={`Are you sure you want to delete the invite for ${inviteToDelete.invitee_email}?`}
        acceptLabel="Delete"
        cancelLabel="Cancel"
      />
      <ConfirmationDialog
        isOpen={isUnarchiveDialogOpen}
        onClose={() => setIsUnarchiveDialogOpen(false)}
        onAccept={() => unarchiveInvite(inviteToUnarchive)}
        color="primary"
        title="Unarchive"
        descriptions={`Are you sure you want to unarchive the invite ${inviteToUnarchive.invitee_email}?`}
        acceptLabel="Unarchive"
        cancelLabel="Cancel"
      />
      {invites.map((invite: any) => (
        <InviteListItem
          key={invite.id}
          invite={invite}
          openUpdateInvite={() => openUpdateInvite(invite)}
          onDeleteInvite={() => deleteClicked(invite)}
          onUnarchiveInvite={() => unarchiveClicked(invite)}
          isArchived={invite.archived}
        />
      ))}
    </>
  )
}

export default InviteListItems

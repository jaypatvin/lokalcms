import React, { useState } from 'react'
import { ConfirmationDialog } from '../../components/Dialog'
import InviteListItem from './InviteListItem'

type Props = {
  invites: any
  openUpdateInvite: (invite: any) => void
}

const InviteListItems = ({ invites, openUpdateInvite }: Props) => {
  const [inviteToDelete, setInviteToDelete] = useState<any>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [inviteToUnarchive, setInviteToUnarchive] = useState<any>({})
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false)

  const deleteInvite = async (invite: any) => {
    if (process.env.REACT_APP_API_URL) {
      const { id } = invite
      let url = `${process.env.REACT_APP_API_URL}/invite/${id}`
      let res: any = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'DELETE',
        body: JSON.stringify({ id }),
      })
      res = await res.json()
      console.log(res)
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
    if (process.env.REACT_APP_API_URL) {
      let url = `${process.env.REACT_APP_API_URL}/invite/${invite.id}`
      let res: any = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PUT',
        body: JSON.stringify({ id: invite.id, unarchive_only: true }),
      })
      res = await res.json()
      console.log(res)
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

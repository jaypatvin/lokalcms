import React, { useState } from 'react'
import { ConfirmationDialog, Dialog } from '../../components/Dialog'
import CommunityListItem from './CommunityListItem'
import { useAuth } from '../../contexts/AuthContext'
import { TextField } from '../../components/inputs'
import { Button } from '../../components/buttons'
import { API_URL } from '../../config/variables'

type Props = {
  communities: any
  openUpdateCommunity: (community: any) => void
}

const CommunityListItems = ({ communities, openUpdateCommunity }: Props) => {
  const { currentUserInfo, currentUser, reauthenticate, firebaseToken } = useAuth()
  const [communityToDelete, setCommunityToDelete] = useState<any>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [communityToArchive, setCommunityToArchive] = useState<any>({})
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [communityToUnarchive, setCommunityToUnarchive] = useState<any>({})
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false)
  const [isTypePasswordOpen, setIsTypePasswordOpen] = useState(false)
  const [isTypeNameOpen, setIsTypeNameOpen] = useState(false)
  const [typedPassword, setTypedPassword] = useState('')
  const [typedName, setTypedName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const deleteCommunity = async (community: any) => {
    if (API_URL && firebaseToken) {
      const { id, name } = community
      let url = `${API_URL}/community/${id}`
      let res: any = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firebaseToken}`,
        },
        method: 'DELETE',
        body: JSON.stringify({ id, name, hard_delete: true }),
      })
      res = await res.json()
      setIsDeleteDialogOpen(false)
      setCommunityToDelete({})
      setTypedPassword('')
      setTypedName('')
      setErrorMessage('')
    } else {
      console.error('environment variable for the api does not exist.')
    }
  }

  const deleteClicked = (community: any) => {
    setIsTypePasswordOpen(true)
    setCommunityToDelete(community)
  }

  const passwordConfirmClicked = () => {
    if (currentUser && reauthenticate) {
      setErrorMessage('')
      reauthenticate(currentUserInfo.email, typedPassword)
        .then((data) => {
          if (data.user) {
            setIsTypePasswordOpen(false)
            setIsTypeNameOpen(true)
          }
        })
        .catch((error) => {
          console.error(error)
          setErrorMessage(error.message)
        })
    }
  }

  const communityConfirmClicked = () => {
    if (typedName === communityToDelete.name) {
      setIsTypeNameOpen(false)
      setIsDeleteDialogOpen(true)
      setErrorMessage('')
    } else {
      setErrorMessage('Community name does not match!')
    }
  }

  const onCancelDelete = () => {
    setIsTypePasswordOpen(false)
    setTypedPassword('')
    setIsTypeNameOpen(false)
    setTypedName('')
    setCommunityToDelete({})
    setErrorMessage('')
  }

  const archiveCommunity = async (community: any) => {
    if (API_URL && firebaseToken) {
      const { id, name } = community
      let url = `${API_URL}/community/${id}`
      let res: any = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firebaseToken}`,
        },
        method: 'DELETE',
        body: JSON.stringify({ id, name }),
      })
      res = await res.json()
      setIsArchiveDialogOpen(false)
      setCommunityToArchive({})
    } else {
      console.error('environment variable for the api does not exist.')
    }
  }

  const archiveClicked = (community: any) => {
    setIsArchiveDialogOpen(true)
    setCommunityToArchive(community)
  }

  const unarchiveCommunity = async (community: any) => {
    if (API_URL && firebaseToken) {
      let url = `${API_URL}/community/${community.id}`
      let res: any = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firebaseToken}`,
        },
        method: 'PUT',
        body: JSON.stringify({ id: community.id, unarchive_only: true }),
      })
      res = await res.json()
      setIsUnarchiveDialogOpen(false)
      setCommunityToUnarchive({})
    } else {
      console.error('environment variable for the api does not exist.')
    }
  }

  const unarchiveClicked = (community: any) => {
    setIsUnarchiveDialogOpen(true)
    setCommunityToUnarchive(community)
  }

  return (
    <>
      <Dialog isOpen={isTypePasswordOpen} title="Confirmation" onClose={onCancelDelete}>
        <p>Please type your password</p>
        <TextField
          label=""
          type="password"
          value={typedPassword}
          onChange={(e) => setTypedPassword(e.target.value)}
        />
        <p className="text-red-600">{errorMessage}</p>
        <div className="flex flex-row-reverse">
          <Button className="ml-1" onClick={onCancelDelete} color="secondary">
            Cancel
          </Button>
          <Button onClick={passwordConfirmClicked}>Confirm</Button>
        </div>
      </Dialog>
      <Dialog isOpen={isTypeNameOpen} title="Confirmation" onClose={onCancelDelete}>
        <p>
          Please type community name{' '}
          <strong className="text-red-600">{communityToDelete.name}</strong>
        </p>
        <TextField
          label=""
          type="text"
          value={typedName}
          onChange={(e) => setTypedName(e.target.value)}
        />
        <p className="text-red-600">{errorMessage}</p>
        <div className="flex flex-row-reverse">
          <Button className="ml-1" onClick={onCancelDelete} color="secondary">
            Cancel
          </Button>
          <Button onClick={communityConfirmClicked}>Confirm</Button>
        </div>
      </Dialog>
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onAccept={() => deleteCommunity(communityToDelete)}
        color="danger"
        title="Delete"
        descriptions={`Are you sure you want to delete community ${communityToDelete.name}?`}
        acceptLabel="Delete"
        cancelLabel="Cancel"
      />
      <ConfirmationDialog
        isOpen={isArchiveDialogOpen}
        onClose={() => setIsArchiveDialogOpen(false)}
        onAccept={() => archiveCommunity(communityToArchive)}
        color="warning"
        title="Archive"
        descriptions={`Are you sure you want to archive community ${communityToDelete.name}?`}
        acceptLabel="Archive"
        cancelLabel="Cancel"
      />
      <ConfirmationDialog
        isOpen={isUnarchiveDialogOpen}
        onClose={() => setIsUnarchiveDialogOpen(false)}
        onAccept={() => unarchiveCommunity(communityToUnarchive)}
        color="primary"
        title="Unarchive"
        descriptions={`Are you sure you want to unarchive community ${communityToUnarchive.name}?`}
        acceptLabel="Unarchive"
        cancelLabel="Cancel"
      />
      {communities.map((community: any) => (
        <CommunityListItem
          key={community.id}
          community={community}
          openUpdateCommunity={() => openUpdateCommunity(community)}
          onDeleteCommunity={() => deleteClicked(community)}
          onArchiveCommunity={() => archiveClicked(community)}
          onUnarchiveCommunity={() => unarchiveClicked(community)}
          hideDelete={currentUserInfo.community_id === community.id}
          disableDelete={community.haveMembers}
          isArchived={community.archived}
        />
      ))}
    </>
  )
}

export default CommunityListItems

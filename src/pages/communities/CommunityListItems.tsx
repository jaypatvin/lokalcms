import React, { useState } from 'react'
import { ConfirmationDialog } from '../../components/Dialog'
import CommunityListItem from './CommunityListItem'
import { useAuth } from '../../contexts/AuthContext'

type Props = {
  communities: any
  openUpdateCommunity: (community: any) => void
}

const CommunityListItems = ({ communities, openUpdateCommunity }: Props) => {
  const { currentUserInfo } = useAuth()
  const [communityToDelete, setCommunityToDelete] = useState<any>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [communityToArchive, setCommunityToArchive] = useState<any>({})
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [communityToUnarchive, setCommunityToUnarchive] = useState<any>({})
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false)

  const deleteCommunity = async (community: any) => {
    console.log('deleting community, joke.')
    setIsDeleteDialogOpen(false)
  }

  const deleteClicked = (community: any) => {
    setIsDeleteDialogOpen(true)
    setCommunityToDelete(community)
  }

  const archiveCommunity = async (community: any) => {
    if (process.env.REACT_APP_API_URL) {
      const { id, name } = community
      let url = `${process.env.REACT_APP_API_URL}/community/${id}`
      let res: any = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'DELETE',
        body: JSON.stringify({ id, name }),
      })
      res = await res.json()
      console.log(res)
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
    if (process.env.REACT_APP_API_URL) {
      let url = `${process.env.REACT_APP_API_URL}/community/${community.id}`
      let res: any = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PUT',
        body: JSON.stringify({ id: community.id, unarchive_only: true }),
      })
      res = await res.json()
      console.log(res)
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

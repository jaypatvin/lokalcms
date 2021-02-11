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

  const unarchiveCommunity = async (community: any) => {
    console.log('unarchiving community, joke')
    setIsUnarchiveDialogOpen(false)
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
        descriptions={`Are you sure you want to delete community ${communityToDelete.email}?`}
        acceptLabel="Delete"
        cancelLabel="Cancel"
      />
      <ConfirmationDialog
        isOpen={isUnarchiveDialogOpen}
        onClose={() => setIsUnarchiveDialogOpen(false)}
        onAccept={() => unarchiveCommunity(communityToUnarchive)}
        color="primary"
        title="Unarchive"
        descriptions={`Are you sure you want to unarchive community ${communityToUnarchive.email}?`}
        acceptLabel="Unarchive"
        cancelLabel="Cancel"
      />
      {communities.map((community: any) => (
        <CommunityListItem
          key={community.id}
          community={community}
          openUpdateCommunity={() => openUpdateCommunity(community)}
          onDeleteCommunity={() => deleteClicked(community)}
          onUnarchiveCommunity={() => unarchiveClicked(community)}
          hideDelete={currentUserInfo.community_id === community.id}
          isArchived={community.status === 'archived'}
        />
      ))}
    </>
  )
}

export default CommunityListItems

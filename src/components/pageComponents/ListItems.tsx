import React, { useState } from 'react'
import { ConfirmationDialog } from '../../components/Dialog'
import ListItem from './ListItem'
import { useAuth } from '../../contexts/AuthContext'
import { PageNames } from '../../utils/types'

type Props = {
  name: PageNames
  onDelete?: (arg: firebase.default.firestore.DocumentData) => Promise<any>
  onArchive: (arg: firebase.default.firestore.DocumentData) => Promise<any>
  onUnarchive: (arg: firebase.default.firestore.DocumentData) => Promise<any>
  dataList: firebase.default.firestore.DocumentData[]
  openUpdate: (arg: firebase.default.firestore.DocumentData) => void
}

const ListItems = ({ name, onArchive, dataList, openUpdate }: Props) => {
  const { currentUserInfo } = useAuth()
  const [dataToDelete, setDataToDelete] = useState<any>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [dataToUnarchive, setDataToUnarchive] = useState<any>({})
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false)

  const deleteData = async (data: firebase.default.firestore.DocumentData) => {
    const res = await onArchive(data)
    console.log('res', res)
    setIsDeleteDialogOpen(false)
    setDataToDelete({})
  }

  const deleteClicked = (user: any) => {
    setIsDeleteDialogOpen(true)
    setDataToDelete(user)
  }

  const unarchiveData = async (data: firebase.default.firestore.DocumentData) => {
    setIsUnarchiveDialogOpen(false)
    setDataToUnarchive({})
  }

  const unarchiveClicked = (user: any) => {
    setIsUnarchiveDialogOpen(true)
    setDataToUnarchive(user)
  }

  return (
    <>
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onAccept={() => deleteData(dataToDelete)}
        color="danger"
        title="Delete"
        descriptions={`Are you sure you want to delete ${dataToDelete.email}?`}
        acceptLabel="Delete"
        cancelLabel="Cancel"
      />
      <ConfirmationDialog
        isOpen={isUnarchiveDialogOpen}
        onClose={() => setIsUnarchiveDialogOpen(false)}
        onAccept={() => unarchiveData(dataToUnarchive)}
        color="primary"
        title="Unarchive"
        descriptions={`Are you sure you want to unarchive ${dataToUnarchive.email}?`}
        acceptLabel="Unarchive"
        cancelLabel="Cancel"
      />
      {dataList.map((data) => (
        <ListItem
          name={name}
          key={data.id}
          data={data}
          openUpdate={() => openUpdate(data)}
          onArchive={() => deleteClicked(data)}
          onUnarchive={() => unarchiveClicked(data)}
          hideDelete={currentUserInfo.id === data.id}
          isArchived={data.archived}
        />
      ))}
    </>
  )
}

export default ListItems

import React, { useState } from 'react'
import { ConfirmationDialog } from '../../components/Dialog'
import ListItem from './ListItem'
import { useAuth } from '../../contexts/AuthContext'
import { PageNames } from '../../utils/types'
import { DocumentType } from '../../models'

type Props = {
  name: PageNames
  onDelete?: (arg: DocumentType) => Promise<any>
  onArchive?: (arg: DocumentType) => Promise<any>
  onUnarchive?: (arg: DocumentType) => Promise<any>
  dataList: DocumentType[]
  openUpdate: (arg: DocumentType) => void
}

const ListItems = ({ name, onArchive, dataList, openUpdate }: Props) => {
  const { currentUserInfo } = useAuth()
  const [dataToDelete, setDataToDelete] = useState<any>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [dataToUnarchive, setDataToUnarchive] = useState<any>({})
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false)

  const deleteData = async (data: DocumentType) => {
    if (onArchive) {
      const res = await onArchive(data)
      console.log('res', res)
      setIsDeleteDialogOpen(false)
      setDataToDelete({})
    }
  }

  const deleteClicked = (data: any) => {
    setIsDeleteDialogOpen(true)
    setDataToDelete(data)
  }

  const unarchiveData = async (data: DocumentType) => {
    setIsUnarchiveDialogOpen(false)
    setDataToUnarchive({})
  }

  const unarchiveClicked = (data: any) => {
    setIsUnarchiveDialogOpen(true)
    setDataToUnarchive(data)
  }

  return (
    <>
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onAccept={() => deleteData(dataToDelete)}
        color="danger"
        title="Delete"
        descriptions={`Are you sure you want to delete ${
          dataToDelete.email || dataToDelete.name || dataToDelete.id
        }?`}
        acceptLabel="Delete"
        cancelLabel="Cancel"
      />
      <ConfirmationDialog
        isOpen={isUnarchiveDialogOpen}
        onClose={() => setIsUnarchiveDialogOpen(false)}
        onAccept={() => unarchiveData(dataToUnarchive)}
        color="primary"
        title="Unarchive"
        descriptions={`Are you sure you want to unarchive ${
          dataToUnarchive.email || dataToUnarchive.name || dataToUnarchive.id
        }?`}
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
          hideDelete={currentUserInfo?.id === data.id}
          isArchived={data.archived}
        />
      ))}
    </>
  )
}

export default ListItems

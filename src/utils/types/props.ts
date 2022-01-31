export type CreateUpdateFormProps = {
  isOpen?: boolean
  setIsOpen?: (val: boolean) => void
  mode?: 'create' | 'update'
  dataToUpdate?: any
  isModal?: boolean
}

export type ListItemProps = {
  data: firebase.default.firestore.DocumentData
  openUpdate: () => void
  onDelete?: () => void
  onArchive: () => void
  onUnarchive: () => void
  hideDelete?: boolean
  disableDelete?: boolean
  isArchived?: boolean
}

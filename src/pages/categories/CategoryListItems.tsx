import React, { useState } from 'react'
import { ConfirmationDialog } from '../../components/Dialog'
import { API_URL } from '../../config/variables'
import CategoryListItem from './CategoryListItem'
import { useAuth } from '../../contexts/AuthContext'

type Props = {
  categories: any
  openUpdateCategory: (category: any) => void
}

const CategoryListItems = ({ categories, openUpdateCategory }: Props) => {
  const { firebaseToken } = useAuth()
  const [categoryToDelete, setCategoryToDelete] = useState<any>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [categoryToUnarchive, setCategoryToUnarchive] = useState<any>({})
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false)

  const deleteCategory = async (category: any) => {
    if (API_URL && firebaseToken) {
      const { id } = category
      let url = `${API_URL}/categories/${id}`
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
      setCategoryToDelete({})
    } else {
      console.error('environment variable for the api does not exist.')
    }
  }

  const deleteClicked = (category: any) => {
    setIsDeleteDialogOpen(true)
    setCategoryToDelete(category)
  }

  const unarchiveCategory = async (category: any) => {
    if (API_URL && firebaseToken) {
      let url = `${API_URL}/categories/${category.id}/unarchive`
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
      setCategoryToUnarchive({})
    } else {
      console.error('environment variable for the api does not exist.')
    }
  }

  const unarchiveClicked = (category: any) => {
    setIsUnarchiveDialogOpen(true)
    setCategoryToUnarchive(category)
  }

  return (
    <>
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onAccept={() => deleteCategory(categoryToDelete)}
        color="danger"
        title="Delete"
        descriptions={`Are you sure you want to delete the category ${categoryToDelete.name}?`}
        acceptLabel="Delete"
        cancelLabel="Cancel"
      />
      <ConfirmationDialog
        isOpen={isUnarchiveDialogOpen}
        onClose={() => setIsUnarchiveDialogOpen(false)}
        onAccept={() => unarchiveCategory(categoryToUnarchive)}
        color="primary"
        title="Unarchive"
        descriptions={`Are you sure you want to unarchive the category ${categoryToUnarchive.name}?`}
        acceptLabel="Unarchive"
        cancelLabel="Cancel"
      />
      {categories.map((category: any) => (
        <CategoryListItem
          key={category.id}
          data={category}
          openUpdate={() => openUpdateCategory(category)}
          onArchive={() => deleteClicked(category)}
          onUnarchive={() => unarchiveClicked(category)}
          isArchived={category.archived}
        />
      ))}
    </>
  )
}

export default CategoryListItems

import React, { useState } from 'react'
import { ConfirmationDialog } from '../../components/Dialog'
import { API_URL } from '../../config/variables'
import ShopListItem from './ShopListItem'
import { useAuth } from '../../contexts/AuthContext'

type Props = {
  shops: any
  openUpdateShop: (shop: any) => void
}

const ShopListItems = ({ shops, openUpdateShop }: Props) => {
  const { firebaseToken } = useAuth()
  const [shopToDelete, setShopToDelete] = useState<any>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [shopToUnarchive, setShopToUnarchive] = useState<any>({})
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false)

  const deleteShop = async (shop: any) => {
    if (API_URL && firebaseToken) {
      const { id } = shop
      let url = `${API_URL}/shops/${id}`
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
      setShopToDelete({})
    } else {
      console.error('environment variable for the api does not exist.')
    }
  }

  const deleteClicked = (shop: any) => {
    setIsDeleteDialogOpen(true)
    setShopToDelete(shop)
  }

  const unarchiveShop = async (shop: any) => {
    if (API_URL && firebaseToken) {
      let url = `${API_URL}/shops/${shop.id}/unarchive`
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
      setShopToUnarchive({})
    } else {
      console.error('environment variable for the api does not exist.')
    }
  }

  const unarchiveClicked = (shop: any) => {
    setIsUnarchiveDialogOpen(true)
    setShopToUnarchive(shop)
  }

  return (
    <>
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onAccept={() => deleteShop(shopToDelete)}
        color="danger"
        title="Delete"
        descriptions={`Are you sure you want to delete the shop ${shopToDelete.name}?`}
        acceptLabel="Delete"
        cancelLabel="Cancel"
      />
      <ConfirmationDialog
        isOpen={isUnarchiveDialogOpen}
        onClose={() => setIsUnarchiveDialogOpen(false)}
        onAccept={() => unarchiveShop(shopToUnarchive)}
        color="primary"
        title="Unarchive"
        descriptions={`Are you sure you want to unarchive the shop ${shopToUnarchive.name}?`}
        acceptLabel="Unarchive"
        cancelLabel="Cancel"
      />
      {shops.map((shop: any) => (
        <ShopListItem
          key={shop.id}
          shop={shop}
          openUpdateShop={() => openUpdateShop(shop)}
          onDeleteShop={() => deleteClicked(shop)}
          onUnarchiveShop={() => unarchiveClicked(shop)}
          isArchived={shop.archived}
        />
      ))}
    </>
  )
}

export default ShopListItems

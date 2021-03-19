import React, { useState } from 'react'
import { ConfirmationDialog } from '../../components/Dialog'
import { API_URL } from '../../config/variables'
import ProductListItem from './ProductListItem'
import { useAuth } from '../../contexts/AuthContext'

type Props = {
  products: any
  openUpdateProduct: (product: any) => void
}

const ProductListItems = ({ products, openUpdateProduct }: Props) => {
  const { firebaseToken } = useAuth()
  const [productToDelete, setProductToDelete] = useState<any>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [productToUnarchive, setProductToUnarchive] = useState<any>({})
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false)

  const deleteProduct = async (product: any) => {
    if (API_URL && firebaseToken) {
      const { id } = product
      let url = `${API_URL}/products/${id}`
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
      setProductToDelete({})
    } else {
      console.error('environment variable for the api does not exist.')
    }
  }

  const deleteClicked = (product: any) => {
    setIsDeleteDialogOpen(true)
    setProductToDelete(product)
  }

  const unarchiveProduct = async (product: any) => {
    if (API_URL && firebaseToken) {
      let url = `${API_URL}/products/${product.id}/unarchive`
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
      setProductToUnarchive({})
    } else {
      console.error('environment variable for the api does not exist.')
    }
  }

  const unarchiveClicked = (product: any) => {
    setIsUnarchiveDialogOpen(true)
    setProductToUnarchive(product)
  }

  return (
    <>
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onAccept={() => deleteProduct(productToDelete)}
        color="danger"
        title="Delete"
        descriptions={`Are you sure you want to delete the product ${productToDelete.name}?`}
        acceptLabel="Delete"
        cancelLabel="Cancel"
      />
      <ConfirmationDialog
        isOpen={isUnarchiveDialogOpen}
        onClose={() => setIsUnarchiveDialogOpen(false)}
        onAccept={() => unarchiveProduct(productToUnarchive)}
        color="primary"
        title="Unarchive"
        descriptions={`Are you sure you want to unarchive the product ${productToUnarchive.name}?`}
        acceptLabel="Unarchive"
        cancelLabel="Cancel"
      />
      {products.map((product: any) => (
        <ProductListItem
          key={product.id}
          product={product}
          openUpdateProduct={() => openUpdateProduct(product)}
          onDeleteProduct={() => deleteClicked(product)}
          onUnarchiveProduct={() => unarchiveClicked(product)}
          isArchived={product.archived}
        />
      ))}
    </>
  )
}

export default ProductListItems

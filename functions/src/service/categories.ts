import { serverTimestamp } from 'firebase/firestore'
import { CategoryCreateData, CategoryUpdateData } from '../models/Category'
import db from '../utils/db'

export const getAllCategories = async () => {
  return await db.categories
    .get()
    .then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const getCategoryById = async (id) => {
  const product = await db.categories.doc(id).get()

  const data = product.data()
  if (data) return { id: product.id, ...data }
  return null
}

export const createCategory = async (data: CategoryCreateData) => {
  return await db.categories
    .doc(data.name)
    .set({ ...data, created_at:serverTimestamp() })
    .then((res) => res)
    .then(() => db.categories.doc(data.name).get())
    .then((doc) => ({ ...doc.data(), id: doc.id }))
}

export const updateCategory = async (id, data: CategoryUpdateData) => {
  return await db.categories.doc(id).update({ ...data, updated_at:serverTimestamp() })
}

export const archiveCategory = async (id: string, data?: any) => {
  let updateData = {
    archived: true,
    archived_at:serverTimestamp(),
    updated_at:serverTimestamp(),
  }
  if (data) updateData = { ...updateData, ...data }
  return await db.categories.doc(id).update(updateData)
}

export const unarchiveCategory = async (id: string, data?: any) => {
  let updateData = { archived: false, updated_at:serverTimestamp() }
  if (data) updateData = { ...updateData, ...data }
  return await db.categories.doc(id).update(updateData)
}

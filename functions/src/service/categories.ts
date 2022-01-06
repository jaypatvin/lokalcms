import { firestore } from 'firebase-admin'
import { CategoryCreateData, CategoryUpdateData } from '../models/Category'
import db from '../utils/db'

export const getAllCategories = async () => {
  return await db.categories
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getCategoryById = async (id) => {
  const product = await db.categories.doc(id).get()

  const data = product.data()
  if (data) return { id: product.id, ...data } as any
  return null
}

export const createCategory = async (data: CategoryCreateData) => {
  return await db.categories
    .doc(data.name)
    .set({ ...data, created_at: firestore.Timestamp.now() })
    .then((res) => res)
    .then(() => db.categories.doc(data.name).get())
    .then((doc): any => ({ ...doc.data(), id: doc.id }))
}

export const updateCategory = async (id, data: CategoryUpdateData) => {
  return await db.categories
    .doc(id)
    .update({ ...data, updated_at: firestore.Timestamp.now() })
}

export const archiveCategory = async (id: string, data?: any) => {
  let updateData = {
    archived: true,
    archived_at: firestore.Timestamp.now(),
    updated_at: firestore.Timestamp.now(),
  }
  if (data) updateData = { ...updateData, ...data }
  return await db.categories.doc(id).update(updateData)
}

export const unarchiveCategory = async (id: string, data?: any) => {
  let updateData = { archived: false, updated_at: firestore.Timestamp.now() }
  if (data) updateData = { ...updateData, ...data }
  return await db.categories.doc(id).update(updateData)
}

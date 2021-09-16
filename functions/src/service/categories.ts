import * as admin from 'firebase-admin'

const db = admin.firestore()
const collectionName = 'categories'

export const getAllCategories = async () => {
  return await db
    .collection(collectionName)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getCategoryById = async (id) => {
  const product = await db.collection(collectionName).doc(id).get()

  const data = product.data()
  if (data) return { id: product.id, ...data } as any
  return data
}

export const createCategory = async (data) => {
  return await db
    .collection(collectionName)
    .doc(data.name)
    .set({ ...data, created_at: new Date() })
    .then((res) => res)
    .then(() => db.collection(collectionName).doc(data.name).get())
    .then((doc): any => ({ ...doc.data(), id: doc.id }))
}

export const updateCategory = async (id, data) => {
  return await db
    .collection(collectionName)
    .doc(id)
    .update({ ...data, updated_at: new Date() })
}

export const archiveCategory = async (id: string, data?: any) => {
  let updateData = { archived: true, archived_at: new Date(), updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db
    .collection(collectionName)
    .doc(id)
    .update(updateData)
}

export const unarchiveCategory = async (id: string, data?: any) => {
  let updateData = { archived: false, updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db
    .collection(collectionName)
    .doc(id)
    .update(updateData)
}

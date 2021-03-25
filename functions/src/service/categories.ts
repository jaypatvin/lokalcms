import * as admin from 'firebase-admin'

const db = admin.firestore()

export const getAllCategories = async () => {
  return await db
    .collection('categories')
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getCategoryById = async (id) => {
  const product = await db.collection('categories').doc(id).get()

  const data = product.data()
  if (data) return { id: product.id, ...data } as any
  return data
}

export const createCategory = async (data) => {
  return await db
    .collection('categories')
    .doc(data.name)
    .set({ ...data, created_at: new Date() })
    .then((res) => {
      return res
    })
}

export const updateCategory = async (id, data) => {
  return await db
    .collection('categories')
    .doc(id)
    .update({ ...data, updated_at: new Date() })
}

export const unarchiveCategory = async (id) => {
  return await db
    .collection('categories')
    .doc(id)
    .update({ archived: false, updated_at: new Date() })
}

export const archiveCategory = async (id) => {
  return await db
    .collection('categories')
    .doc(id)
    .update({ archived: true, updated_at: new Date(), archived_at: new Date() })
}

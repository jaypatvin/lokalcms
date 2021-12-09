import * as admin from 'firebase-admin'

const db = admin.firestore()
const collectionName = 'bank_codes'

export const getAllCategories = async () => {
  return await db
    .collection(collectionName)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getBankCodeById = async (id) => {
  const bankCode = await db.collection(collectionName).doc(id).get()

  const data = bankCode.data()
  if (data) return { id: bankCode.id, ...data } as any
  return data
}

export const createBankCode = async (data) => {
  return await db
    .collection(collectionName)
    .doc(data.name)
    .set({ ...data, created_at: new Date() })
    .then((res) => res)
    .then(() => db.collection(collectionName).doc(data.name).get())
    .then((doc): any => ({ ...doc.data(), id: doc.id }))
}

export const updateBankCode = async (id, data) => {
  return await db
    .collection(collectionName)
    .doc(id)
    .update({ ...data, updated_at: new Date() })
}

export const archiveBankCode = async (id: string, data?: any) => {
  let updateData = { archived: true, archived_at: new Date(), updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db
    .collection(collectionName)
    .doc(id)
    .update(updateData)
}

export const unarchiveBankCode = async (id: string, data?: any) => {
  let updateData = { archived: false, updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db
    .collection(collectionName)
    .doc(id)
    .update(updateData)
}

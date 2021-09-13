import * as admin from 'firebase-admin'

const db = admin.firestore()
const collectionName = 'users'

export const getUsers = () => {
  return db
    .collection(collectionName)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getUserByUID = async (uid) => {
  return await db
    .collection(collectionName)
    .where('user_uids', 'array-contains', uid)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getUserByID = async (id) => {
  const doc = await db.collection(collectionName).doc(id).get()

  const data = doc.data()
  if (data) return { id: doc.id, ...data }
  return data
}

export const getUsersByCommunityId = async (id: string) => {
  return await db
    .collection(collectionName)
    .where('community_id', '==', id)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const createUser = async (data) => {
  return await db
    .collection(collectionName)
    .add({ ...data, created_at: new Date() })
    .then((res) => {
      return res
    })
}

export const updateUser = async (id, data) => {
  return await db
    .collection(collectionName)
    .doc(id)
    .update({ ...data, updated_at: new Date() })
    .then(() => db.collection(collectionName).doc(id).get())
    .then((doc): any => ({ ...doc.data(), id: doc.id }))
}

export const archiveUser = async (id: string, data?: any) => {
  let updateData = { archived: true, archived_at: new Date(), updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db
    .collection(collectionName)
    .doc(id)
    .update(updateData)
    .then(() => db.collection(collectionName).doc(id).get())
    .then((doc): any => ({ ...doc.data(), id: doc.id }))
}

export const unarchiveUser = async (id: string, data?: any) => {
  let updateData = { archived: false, updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db
    .collection(collectionName)
    .doc(id)
    .update(updateData)
    .then(() => db.collection(collectionName).doc(id).get())
    .then((doc): any => ({ ...doc.data(), id: doc.id }))
}

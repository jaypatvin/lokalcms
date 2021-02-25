import * as admin from 'firebase-admin'

const db = admin.firestore()

export const getUsers = () => {
  return db
    .collection('users')
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getUserByUID = async (uid) => {
  return await db
    .collection('users')
    .where('user_uids', 'array-contains', uid)
    .get()
    .then((res) => res.docs.map((doc) => doc.data()))
}

export const getUserByID = async (id) => {
  const doc = await db
    .collection('users')
    .doc(id)
    .get()

  const data = doc.data()
  if (data) return { id: doc.id, ...data }
  return data
}

export const getUsersByCommunityId = async (id: string) => {
  return await db
    .collection('users')
    .where('community_id', '==', id)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const createUser = async (data) => {
  return await db
    .collection('users')
    .add({ ...data, created_at: new Date() })
    .then((res) => {
      return res
    })
}

export const updateUser = async (id, data) => {
  return await db
    .collection('users')
    .doc(id)
    .update({ ...data, updated_at: new Date() })
}

export const archiveUser = async (id) => {
  return await db
    .collection('users')
    .doc(id)
    .update({ status: 'archived', archived_at: new Date(), updated_at: new Date() })
}

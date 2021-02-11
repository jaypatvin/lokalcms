import * as admin from 'firebase-admin'

const db = admin.firestore()

export const getUserByUID = async (uid) => {
    return await db
                  .collection('users')
                  .where('user_uids', 'array-contains', uid)
                  .get()
                  .then(res => res.docs.map(doc => doc.data()))
}

export const getUserByID = async (id) => {
  return await db
                .collection('users')
                .doc(id)
                .get()
                .then((res) => {
                    return res.data()
                })
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

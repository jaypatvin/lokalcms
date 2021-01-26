import * as admin from 'firebase-admin'

const db = admin.firestore()

export const getUserByUID = async (uid) => {
    return await db
                  .collection('users')
                  .where('user_uids', 'array-contains', uid)
                  .get()
                  .then(res => res.docs.map(doc => doc.data()))
}


export const createUser = async (data) => {
  return await db
                  .collection('users')
                  .add(data)
                  .then((res) => {
                    return res
                  })
}
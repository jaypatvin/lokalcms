import * as admin from 'firebase-admin'

const db = admin.firestore()
const collectionName = 'action_types'

export const getAllActionTypes = async () => {
  return await db
    .collection(collectionName)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getActionTypeById = async (id) => {
  const actionType = await db.collection(collectionName).doc(id).get()

  const data = actionType.data()
  if (data) return { id: actionType.id, ...data } as any
  return data
}

export const createActionType = async (id: string, data: any) => {
  return await db
    .collection(collectionName)
    .doc(id)
    .set({ ...data, created_at: new Date() })
    .then((res) => res)
    .then(() => db.collection(collectionName).doc(id).get())
    .then((doc): any => ({ ...doc.data(), id: doc.id }))
}

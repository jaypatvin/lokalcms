import * as admin from 'firebase-admin'

const db = admin.firestore()

export const getAllActionTypes = async () => {
  return await db
    .collection('action_types')
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getActionTypeById = async (id) => {
  const actionType = await db.collection('action_types').doc(id).get()

  const data = actionType.data()
  if (data) return { id: actionType.id, ...data } as any
  return data
}

export const createActionType = async (id: string, data: any) => {
  return await db
    .collection('action_types')
    .doc(id)
    .set({ ...data, created_at: new Date() })
    .then((res) => {
      return res
    })
}

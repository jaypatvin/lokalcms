import db from '../utils/db'

export const getAllActionTypes = async () => {
  return await db.actionTypes
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getActionTypeById = async (id: string) => {
  const actionType = await db.actionTypes.doc(id).get()

  const data = actionType.data()
  if (data) return { id: actionType.id, ...data }
  return data
}

export const createActionType = async (id: string, data: any) => {
  return await db.actionTypes
    .doc(id)
    .set({ ...data, created_at: new Date() })
    .then((res) => res)
    .then(() => db.actionTypes.doc(id).get())
    .then((doc): any => ({ ...doc.data(), id: doc.id }))
}

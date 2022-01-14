import { ActionType } from '../models'
import db from '../utils/db'

export const getAllActionTypes = async () => {
  return await db.actionTypes
    .get()
    .then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const getActionTypeById = async (id: string) => {
  const actionType = await db.actionTypes.doc(id).get()

  const data = actionType.data()
  if (data) return { id: actionType.id, ...data }
  return null
}

export const createActionType = async (id: string, data: ActionType) => {
  return await db.actionTypes
    .doc(id)
    .set({ ...data })
    .then((res) => res)
    .then(() => db.actionTypes.doc(id).get())
    .then((doc) => ({ ...doc.data(), id: doc.id }))
}

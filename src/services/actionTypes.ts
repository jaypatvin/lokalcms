import { db } from '../utils'

export const fetchActionTypesByID = async (id: string) => {
  return db.actionTypes.doc(id).get()
}

export const getActionTypes = () => {
  return db.actionTypes
}

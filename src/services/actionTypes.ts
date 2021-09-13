import { db } from './firebase'

export const fetchActionTypesByID = async (id: string) => {
  return db.collection('action_types').doc(id).get()
}

export const getActionTypes = () => {
  return db.collection('action_types')
}

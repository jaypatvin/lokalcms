import { doc, setDoc } from 'firebase/firestore'
import db from '../../utils/db'
import sleep from '../../utils/sleep'
import { actionTypes } from './mockData/actionTypes'

export const seedActionTypes = async () => {
  for (const actionType of actionTypes) {
    try {
      await sleep(100)
      const {
        id,
        associated_collection,
        can_archive,
        community_admin_visible,
        description,
        name,
        user_visible,
      } = actionType
      await setDoc(doc(db.actionTypes, id), {
        associated_collection,
        can_archive,
        community_admin_visible,
        description,
        name,
        user_visible,
      })
    } catch (error) {
      console.error('Error creating action type:', error)
    }
  }
}

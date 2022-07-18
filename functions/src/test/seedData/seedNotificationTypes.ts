import { setDoc, doc } from 'firebase/firestore'
import db from '../../utils/db'
import sleep from '../../utils/sleep'
import { notificationTypes } from './mockData/notificationTypes'

export const seedNotificationTypes = async () => {
  for (const notificationType of notificationTypes) {
    try {
      await sleep(100)
      const { id, description, name } = notificationType
      await setDoc(doc(db.notificationTypes, id), {
        description,
        name,
      })
    } catch (error) {
      console.error('Error creating notification type:', error)
    }
  }
}

import * as admin from 'firebase-admin'

const db = admin.firestore()

export const getAllUserNotifications = async (id: string) => {
  return await db
    .collection('users')
    .doc(id)
    .collection('notifications')
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const createUserNotification = async (id: string, data: any) => {
  return await db
    .collection('users')
    .doc(id)
    .collection('notifications')
    .add({
      ...data,
      created_at: new Date(),
      viewed: false,
      opened: false,
      unread: true,
      archived: false,
    })
    .then((res) => {
      return res.get()
    })
    .then((doc): any => ({ id: doc.id, ...doc.data() }))
}

export const updateUserNotification = async (userId: string, notificationId: string, data: any) => {
  return await db
    .collection('users')
    .doc(userId)
    .collection('notifications')
    .doc(notificationId)
    .update({ ...data, updated_at: new Date() })
    .then(() =>
      db.collection('users').doc(userId).collection('notifications').doc(notificationId).get()
    )
    .then((doc): any => ({ ...doc.data(), id: doc.id }))
}

export const archiveUserNotification = async (
  userId: string,
  notificationId: string,
  data?: any
) => {
  let updateData = { archived: true, archived_at: new Date(), updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db
    .collection('users')
    .doc(userId)
    .collection('notifications')
    .doc(notificationId)
    .update(updateData)
    .then(() =>
      db.collection('users').doc(userId).collection('notifications').doc(notificationId).get()
    )
    .then((doc): any => ({ ...doc.data(), id: doc.id }))
}

export const unarchiveUserNotification = async (
  userId: string,
  notificationId: string,
  data?: any
) => {
  let updateData = { archived: false, updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db
    .collection('users')
    .doc(userId)
    .collection('notifications')
    .doc(notificationId)
    .update(updateData)
    .then(() =>
      db.collection('users').doc(userId).collection('notifications').doc(notificationId).get()
    )
    .then((doc): any => ({ ...doc.data(), id: doc.id }))
}

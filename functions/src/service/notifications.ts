import db from '../utils/db'

export const getAllUserNotifications = async (id: string) => {
  return await db
    .getNotifications(`users/${id}/notifications`)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const createUserNotification = async (id: string, data: any) => {
  return await db
    .getNotifications(`users/${id}/notifications`)
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
    .getNotifications(`users/${userId}/notifications`)
    .doc(notificationId)
    .update({ ...data, updated_at: new Date() })
}

export const archiveUserNotification = async (
  userId: string,
  notificationId: string,
  data?: any
) => {
  let updateData = { archived: true, archived_at: new Date(), updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db
    .getNotifications(`users/${userId}/notifications`)
    .doc(notificationId)
    .update(updateData)
}

export const unarchiveUserNotification = async (
  userId: string,
  notificationId: string,
  data?: any
) => {
  let updateData = { archived: false, updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db
    .getNotifications(`users/${userId}/notifications`)
    .doc(notificationId)
    .update(updateData)
}

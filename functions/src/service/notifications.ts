import { firestore } from 'firebase-admin'
import { NotificationCreateData } from '../models/Notification'
import db from '../utils/db'

export const getAllUserNotifications = async (id: string) => {
  return await db
    .getNotifications(`users/${id}/notifications`)
    .get()
    .then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const createUserNotification = async (id: string, data: NotificationCreateData) => {
  return await db
    .getNotifications(`users/${id}/notifications`)
    .add({
      ...data,
      created_at: firestore.Timestamp.now(),
      viewed: false,
      opened: false,
      unread: true,
      archived: false,
    })
    .then((res) => {
      return res.get()
    })
    .then((doc) => ({ id: doc.id, ...doc.data() }))
}

export const updateUserNotification = async (userId: string, notificationId: string, data: any) => {
  return await db
    .getNotifications(`users/${userId}/notifications`)
    .doc(notificationId)
    .update({ ...data, updated_at: firestore.Timestamp.now() })
}

export const archiveUserNotification = async (
  userId: string,
  notificationId: string,
  data?: any
) => {
  let updateData = {
    archived: true,
    archived_at: firestore.Timestamp.now(),
    updated_at: firestore.Timestamp.now(),
  }
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
  let updateData = { archived: false, updated_at: firestore.Timestamp.now() }
  if (data) updateData = { ...updateData, ...data }
  return await db
    .getNotifications(`users/${userId}/notifications`)
    .doc(notificationId)
    .update(updateData)
}

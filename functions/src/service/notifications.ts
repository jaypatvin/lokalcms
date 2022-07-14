import { NotificationCreateData } from '../models/Notification'
import db from '../utils/db'
import { createBaseMethods } from './base'

export const findAllUserNotifications = async (userId: string) => {
  return createBaseMethods(db.getNotifications(`users/${userId}/notifications`)).findAll()
}

export const create = (userId: string, data: NotificationCreateData) => {
  return createBaseMethods(db.getNotifications(`users/${userId}/notifications`)).create({
    ...data,
    viewed: false,
    opened: false,
    unread: true,
  })
}

export const update = (userId: string, notificationId: string, data) => {
  return createBaseMethods(db.getNotifications(`users/${userId}/notifications`)).update(
    notificationId,
    data
  )
}

export const archive = (userId: string, notificationId: string, data) => {
  return createBaseMethods(db.getNotifications(`users/${userId}/notifications`)).archive(
    notificationId,
    data
  )
}

export const unarchive = (userId: string, notificationId: string, data) => {
  return createBaseMethods(db.getNotifications(`users/${userId}/notifications`)).unarchive(
    notificationId,
    data
  )
}

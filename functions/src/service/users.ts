import * as admin from 'firebase-admin'
import { UserUpdateData } from '../models/User'
import db from '../utils/db'

export const getUsers = () => {
  return db.users.get().then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const getUserByUID = async (uid) => {
  return await db.users
    .where('user_uids', 'array-contains', uid)
    .get()
    .then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const getUserByID = async (id) => {
  const doc = await db.users.doc(id).get()

  const data = doc.data()
  if (data) return { id: doc.id, ...data }
  return data
}

export const getUsersByCommunityId = async (id: string) => {
  return await db.users
    .where('community_id', '==', id)
    .get()
    .then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const createUser = async (data) => {
  return await db.users.add({ ...data, created_at: new Date() }).then((res) => {
    return res
  })
}

export const updateUser = async (id, data) => {
  return await db.users.doc(id).update({ ...data, updated_at: new Date() })
}

export const archiveUser = async (id: string, data?: UserUpdateData) => {
  let updateData = { archived: true, archived_at: new Date(), updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db.users.doc(id).update(updateData)
}

export const unarchiveUser = async (id: string, data?: UserUpdateData) => {
  let updateData = { archived: false, updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db.users.doc(id).update(updateData)
}

export const incrementUserWishlistCount = async (id: string) => {
  return await db.users.doc(id).update({
    '_meta.wishlists_count': admin.firestore.FieldValue.increment(1),
  })
}

export const decrementUserWishlistCount = async (id: string) => {
  return await db.users.doc(id).update({
    '_meta.wishlists_count': admin.firestore.FieldValue.increment(-1),
  })
}

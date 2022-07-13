import { doc, increment, updateDoc, where } from 'firebase/firestore'
import { UserCreateData, UserUpdateData } from '../models/User'
import db from '../utils/db'
import { createBaseMethods } from './base'

const {
  findAll,
  findById,
  findByCommunityId,
  create: baseCreate,
  update: baseUpdate,
  archive: baseArchive,
  unarchive: baseUnarchive,
} = createBaseMethods(db.users)

export { findAll, findByCommunityId, findById }

export const create = (data: UserCreateData) => baseCreate(data)
export const update = (id: string, data: UserUpdateData) => baseUpdate(id, data)
export const archive = (id: string, data: UserUpdateData) => baseArchive(id, data)
export const unarchive = (id: string, data: UserUpdateData) => baseUnarchive(id, data)

export const findUserByUid = async (uid: string) => {
  return await findAll({
    wheres: [where('user_uids', 'array-contains', uid)],
  })
}

export const incrementUserWishlistCount = async (id: string) => {
  const docRef = doc(db.users, id)
  return await updateDoc(docRef, {
    '_meta.wishlists_count': increment(1),
  })
}

export const decrementUserWishlistCount = async (id: string) => {
  const docRef = doc(db.users, id)
  return await updateDoc(docRef, {
    '_meta.wishlists_count': increment(-1),
  })
}

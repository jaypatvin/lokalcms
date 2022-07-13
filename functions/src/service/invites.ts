import { query, where, getDocs, updateDoc } from 'firebase/firestore'
import { InviteCreateData, InviteUpdateData } from '../models/Invite'
import db from '../utils/db'
import { createBaseMethods } from './base'

const {
  findAll,
  findOne,
  findById,
  findByCommunityId,
  create: baseCreate,
  update: baseUpdate,
  archive: baseArchive,
  unarchive: baseUnarchive,
} = createBaseMethods(db.invites)

export { findAll, findByCommunityId, findById }

export const create = (data: InviteCreateData) => baseCreate(data)
export const update = (id: string, data: InviteUpdateData) => baseUpdate(id, data)
export const archive = (id: string, data: InviteUpdateData) => baseArchive(id, data)
export const unarchive = (id: string, data: InviteUpdateData) => baseUnarchive(id, data)

export const disableInvitesByEmail = async (email: string) => {
  const q = await query(
    db.invites,
    where('invitee_email', '==', email),
    where('status', '==', 'enabled')
  )
  const docsRef = await getDocs(q)

  if (!docsRef.empty) {
    for (let i = 0; i < docsRef.size; i++) {
      const doc = docsRef.docs[i]
      await updateDoc(doc.ref, { status: 'disabled' })
    }
  }

  return docsRef.size
}

export const findInviteByCode = async (code: string) => {
  return await findOne({
    wheres: [where('code', '==', code), where('status', '==', 'enabled')],
  })
}

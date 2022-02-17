import { firestore } from 'firebase-admin'
import { InviteCreateData, InviteUpdateData } from '../models/Invite'
import db from '../utils/db'

export const getInviteByID = async (id: string) => {
  return await db.invites
    .doc(id)
    .get()
    .then((res) => ({ ...res.data(), id: res.id }))
}

export const disableInvitesByEmail = async (email: string) => {
  const invites = await db.invites
    .where('invitee_email', '==', email)
    .where('status', '==', 'enabled')
    .get()

  if (!invites.empty) {
    for (let i = 0; i < invites.size; i++) {
      const doc = invites.docs[i]
      await doc.ref.update({ status: 'disabled' })
    }
  }

  return invites.size
}

export const getInviteByCode = async (code: string) => {
  return await db.invites
    .where('code', '==', code)
    .where('status', '==', 'enabled')
    .get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        const res = querySnapshot.docs[0]
        return { ...res.data(), id: res.id }
      }
      return null
    })
}

export const createInvite = async (data: InviteCreateData) => {
  const docRef = await db.invites.add({ ...data, created_at: firestore.Timestamp.now() })

  const doc = await docRef.get()
  return { id: doc.id, ...doc.data() }
}

export const updateInvite = async (id, data: InviteUpdateData) => {
  return await db.invites.doc(id).update({ ...data, updated_at: firestore.Timestamp.now() })
}

export const archiveInvite = async (id: string, data?: InviteUpdateData) => {
  let updateData = {
    archived: true,
    archived_at: firestore.Timestamp.now(),
    updated_at: firestore.Timestamp.now(),
  }
  if (data) updateData = { ...updateData, ...data }
  return await db.invites.doc(id).update(updateData)
}

export const unarchiveInvite = async (id: string, data?: InviteUpdateData) => {
  let updateData = { archived: false, updated_at: firestore.Timestamp.now() }
  if (data) updateData = { ...updateData, ...data }
  return await db.invites.doc(id).update(updateData)
}

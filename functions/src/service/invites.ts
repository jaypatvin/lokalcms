import db from '../utils/db'

export const getInviteByID = async (id) => {
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

export const getInviteByCode = async (code) => {
  return await db.invites
    .where('code', '==', code)
    .where('status', '==', 'enabled')
    .get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        const res = querySnapshot.docs[0]
        return { ...res.data(), id: res.id }
      }
      return !querySnapshot.empty
    })
}

export const createInvite = async (data) => {
  const docRef = await db.invites.add({ ...data, created_at: new Date() })

  const doc = await docRef.get()
  return { id: doc.id, ...doc.data() }
}

export const updateInvite = async (id, data) => {
  return await db.invites.doc(id).update({ ...data, updated_at: new Date() })
}

export const archiveInvite = async (id: string, data?: any) => {
  let updateData = { archived: true, archived_at: new Date(), updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db.invites.doc(id).update(updateData)
}

export const unarchiveInvite = async (id: string, data?: any) => {
  let updateData = { archived: false, updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db.invites.doc(id).update(updateData)
}

import * as admin from 'firebase-admin'

const db = admin.firestore()
const collectionName = 'invites'

export const getInviteByID = async (id) => {
  return await db
    .collection(collectionName)
    .doc(id)
    .get()
    .then((res) => {
      let _ret = res.data()
      _ret.id = res.id
      _ret.referencePath = res.ref.path
      return _ret
    })
}

export const disableInvitesByEmail = async (email: string) => {
  const invites = await db
    .collection(collectionName)
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
  return await db
    .collection(collectionName)
    .where('code', '==', code)
    .where('status', '==', 'enabled')
    .get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        const res = querySnapshot.docs[0]
        let _ret = res.data()
        _ret.id = res.id
        _ret.referencePath = res.ref.path
        return _ret
      }
      return !querySnapshot.empty
    })
}

export const createInvite = async (data) => {
  const docRef = await db.collection(collectionName).add({ ...data, created_at: new Date() })

  const doc = await docRef.get()
  return { id: doc.id, ...doc.data() }
}

export const updateInvite = async (id, data) => {
  return await db
    .collection(collectionName)
    .doc(id)
    .update({ ...data, updated_at: new Date() })
}

export const archiveInvite = async (id: string, data?: any) => {
  let updateData = { archived: true, archived_at: new Date(), updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db
    .collection(collectionName)
    .doc(id)
    .update(updateData)
}

export const unarchiveInvite = async (id: string, data?: any) => {
  let updateData = { archived: false, updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db
    .collection(collectionName)
    .doc(id)
    .update(updateData)
}

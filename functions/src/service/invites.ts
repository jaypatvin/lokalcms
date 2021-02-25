import * as admin from 'firebase-admin'

const db = admin.firestore()

export const getInviteByID = async (id) => {
  return await db
    .collection('invites')
    .doc(id)
    .get()
    .then((res) => {
      let _ret = res.data()
      _ret.id = res.id
      _ret.referencePath = res.ref.path
      return _ret
    })
}

export const updateInvite = async (id, data) => {
  const inviteRef = db.collection('invites').doc(id)

  return await inviteRef.set(data, { merge: true })
}

export const getInviteByCode = async (code) => {
  return await db
    .collection('invites')
    .where('code', '==', code)
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
  const docRef = await db
    .collection('invites')
    .add({ ...data, created_at: new Date() })

  const doc = await docRef.get()
  return { id: doc.id, ...doc.data() }
}

import * as admin from 'firebase-admin'

const db = admin.firestore()

export const getCommunities = () => {
  return db
    .collection('community')
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getCommunityByID = async (id) => {
  return await db
    .collection('community')
    .doc(id)
    .get()
    .then((res) => {
      let _ret = res.data()
      if (_ret) _ret.referencePath = res.ref.path
      return _ret
    })
}

export const getCommunitiesByName = async (name: string) => {
  return await db
    .collection('community')
    .where('name', '==', name)
    .get()
    .then((res) => res.docs.map((doc) => doc.data()))
}

type NameAndAddressArgs = {
  name: string
  subdivision: string
  city: string
  barangay: string
  zip_code: string
}

export const getCommunitiesByNameAndAddress = async (options: NameAndAddressArgs) => {
  const { name, subdivision, city, barangay, zip_code } = options
  return await db
    .collection('community')
    .where('name', '==', name)
    .where('address.subdivision', '==', subdivision)
    .where('address.city', '==', city)
    .where('address.barangay', '==', barangay)
    .where('address.zip_code', '==', zip_code)
    .get()
    .then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const createCommunity = async (data) => {
  return await db.collection('community').add({ ...data, created_at: new Date() })
}

export const updateCommunity = async (id, data) => {
  return await db
    .collection('community')
    .doc(id)
    .update({ ...data, updated_at: new Date() })
}

export const archiveCommunity = async (id) => {
  return await db
    .collection('community')
    .doc(id)
    .update({ archived: true, archived_at: new Date(), updated_at: new Date() })
}

export const unarchiveCommunity = async (id) => {
  return await db
    .collection('community')
    .doc(id)
    .update({ archived: false, updated_at: new Date() })
}

export const deleteCommunity = async (id) => {
  return await db.collection('community').doc(id).delete()
}

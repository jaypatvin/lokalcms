import * as admin from 'firebase-admin'

const db = admin.firestore()

export const getCommunityByID = async (id) => {
  return await db
    .collection('community')
    .doc(id)
    .get()
    .then((res) => {
      let _ret = res.data()
      _ret.referencePath = res.ref.path
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
    .then((res) => res.docs.map((doc) => doc.data()))
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

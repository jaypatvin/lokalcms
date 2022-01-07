import { firestore } from 'firebase-admin'
import { CommunityCreateData, CommunityUpdateData } from '../models/Community'
import db from '../utils/db'

export const getCommunities = () => {
  return db.community.get().then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const getCommunityByID = async (id) => {
  const community = await db.community.doc(id).get()

  const data = community.data()
  if (data) return { id: community.id, ...data }
  return null
}

export const getCommunitiesByName = async (name: string) => {
  return await db.community
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
  return await db.community
    .where('name', '==', name)
    .where('address.subdivision', '==', subdivision)
    .where('address.city', '==', city)
    .where('address.barangay', '==', barangay)
    .where('address.zip_code', '==', zip_code)
    .get()
    .then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const createCommunity = async (data: CommunityCreateData) => {
  return await db.community.add({ ...data, created_at: firestore.Timestamp.now() })
}

export const updateCommunity = async (id, data: CommunityUpdateData) => {
  return await db.community
    .doc(id)
    .update({ ...data, updated_at: firestore.Timestamp.now() })
}

export const archiveCommunity = async (id: string, data?: CommunityUpdateData) => {
  let updateData = {
    archived: true,
    archived_at: firestore.Timestamp.now(),
    updated_at: firestore.Timestamp.now(),
  }
  if (data) updateData = { ...updateData, ...data }
  return await db.community.doc(id).update(updateData)
}

export const unarchiveCommunity = async (id: string, data?: CommunityUpdateData) => {
  let updateData = { archived: false, updated_at: firestore.Timestamp.now() }
  if (data) updateData = { ...updateData, ...data }
  return await db.community.doc(id).update(updateData)
}

export const deleteCommunity = async (id) => {
  return await db.community.doc(id).delete()
}

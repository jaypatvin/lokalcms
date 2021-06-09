import * as admin from 'firebase-admin'
import hashArrayOfStrings from '../utils/hashArrayOfStrings'

const db = admin.firestore()

export const getAllChats = async () => {
  return await db
    .collection('chats')
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getChatById = async (id) => {
  const chat = await db.collection('chats').doc(id).get()

  const data = chat.data()
  if (data) return { id: chat.id, ...data } as any
  return data
}

export const getGroupChatByHash = async (group_hash: string) => {
  const chat = await db.collection('chats').where('group_hash', '==', group_hash).limit(1).get()

  const data = !chat.empty ? { id: chat.docs[0].id, ...chat.docs[0].data() } : null
  return data
}

export const createChat = async (data) => {
  return await db
    .collection('chats')
    .add({ ...data, created_at: new Date() })
    .then((res) => {
      return res.get()
    })
    .then((doc): any => ({ id: doc.id, ...doc.data() }))
}

export const createChatWithHashId = async (hash_id, data) => {
  return await db
    .collection('chats')
    .doc(hash_id)
    .set({ ...data, created_at: new Date() })
    .then((res) => {
      return res
    })
}

export const updateChat = async (id, data) => {
  return await db
    .collection('chats')
    .doc(id)
    .update({ ...data, updated_at: new Date() })
}

export const archiveChat = async (id: string, data?: any) => {
  let updateData = { archived: true, archived_at: new Date(), updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db.collection('chats').doc(id).update(updateData)
}

export const unarchiveChat = async (id: string, data?: any) => {
  let updateData = { archived: false, updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db.collection('chats').doc(id).update(updateData)
}

import { firestore } from 'firebase-admin'
import { ChatCreateData, ChatUpdateData } from '../models/Chat'
import db from '../utils/db'

export const getAllChats = async () => {
  return await db.chats.get().then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const getChatById = async (id: string) => {
  const chat = await db.chats.doc(id).get()

  const data = chat.data()
  if (data) return { id: chat.id, ...data }
  return null
}

export const getGroupChatByHash = async (group_hash: string) => {
  const chat = await db.chats.where('group_hash', '==', group_hash).limit(1).get()

  const data = !chat.empty ? { id: chat.docs[0].id, ...chat.docs[0].data() } : null
  return null
}

export const createChat = async (data: ChatCreateData) => {
  return await db.chats
    .add({ ...data, created_at: firestore.Timestamp.now() })
    .then((res) => res.get())
    .then((doc) => ({ id: doc.id, ...doc.data() }))
}

export const createChatWithHashId = async (hash_id: string, data: ChatCreateData) => {
  return await db.chats
    .doc(hash_id)
    .set({ ...data, created_at: firestore.Timestamp.now() })
    .then((res) => res)
    .then(() => db.chats.doc(hash_id).get())
    .then((doc) => ({ ...doc.data(), id: doc.id }))
}

export const updateChat = async (id: string, data: ChatUpdateData) => {
  return await db.chats.doc(id).update({ ...data, updated_at: firestore.Timestamp.now() })
}

export const archiveChat = async (id: string, data?: ChatUpdateData) => {
  let updateData = {
    archived: true,
    archived_at: firestore.Timestamp.now(),
    updated_at: firestore.Timestamp.now(),
  }
  if (data) updateData = { ...updateData, ...data }
  return await db.chats.doc(id).update(updateData)
}

export const unarchiveChat = async (id: string, data?: ChatUpdateData) => {
  let updateData = { archived: false, updated_at: firestore.Timestamp.now() }
  if (data) updateData = { ...updateData, ...data }
  return await db.chats.doc(id).update(updateData)
}

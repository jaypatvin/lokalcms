import * as admin from 'firebase-admin'

const db = admin.firestore()

export const getAllChatMessages = async () => {
  return await db
    .collection('chats')
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getChatMessageById = async (id, chat_id) => {
  const message = await db.collection('chats').doc(chat_id).collection('conversation').doc(id).get()

  const data = message.data()
  if (data) return { id: message.id, ...data } as any
  return data
}

export const createChatMessage = async (chat_id, data) => {
  return await db
    .collection('chats')
    .doc(chat_id)
    .collection('conversation')
    .add({ ...data, created_at: new Date() })
    .then((res) => {
      return res.get()
    })
    .then((doc) => doc.data())
}

export const updateChatMessage = async (chat_id, id, data) => {
  return await db
    .collection('chats')
    .doc(chat_id)
    .collection('conversation')
    .doc(id)
    .update({ ...data, updated_at: new Date() })
}

export const archiveChatMessage = async (chat_id: string, id: string, data?: any) => {
  let updateData = { archived: true, archived_at: new Date(), updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db
    .collection('chats')
    .doc(chat_id)
    .collection('conversation')
    .doc(id)
    .update(updateData)
}

export const unarchiveChatMessage = async (chat_id: string, id: string, data?: any) => {
  let updateData = { archived: false, updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db
    .collection('chats')
    .doc(chat_id)
    .collection('conversation')
    .doc(id)
    .update(updateData)
}

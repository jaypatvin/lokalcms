import db from '../utils/db'

export const getAllChatMessages = async (chat_id: string) => {
  return await db
    .getChatConversations(`chats/${chat_id}/conversation`)
    .get()
    .then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const getChatMessageById = async (chat_id: string, id: string) => {
  const message = await db.getChatConversations(`chats/${chat_id}/conversation`).doc(id).get()

  const data = message.data()
  if (data) return { id: message.id, ...data } as any
  return data
}

export const createChatMessage = async (chat_id: string, data: any) => {
  return await db
    .getChatConversations(`chats/${chat_id}/conversation`)
    .add({ ...data, created_at: new Date() })
    .then((res) => {
      return res.get()
    })
    .then((doc) => ({ ...doc.data(), id: doc.id }))
}

export const updateChatMessage = async (chat_id: string, id: string, data: any) => {
  return await db
    .getChatConversations(`chats/${chat_id}/conversation`)
    .doc(id)
    .update({ ...data, updated_at: new Date() })
}

export const archiveChatMessage = async (chat_id: string, id: string, data?: any) => {
  let updateData = { archived: true, archived_at: new Date(), updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db.getChatConversations(`chats/${chat_id}/conversation`).doc(id).update(updateData)
}

export const unarchiveChatMessage = async (chat_id: string, id: string, data?: any) => {
  let updateData = { archived: false, updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db.getChatConversations(`chats/${chat_id}/conversation`).doc(id).update(updateData)
}

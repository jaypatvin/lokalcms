import { ConversationCreateData } from '../models/Conversation'
import db from '../utils/db'
import { createBaseMethods } from './base'

export const create = (chatId: string, data: ConversationCreateData) => {
  return createBaseMethods(db.getChatConversations(`chats/${chatId}/conversation`)).create({
    ...data,
    viewed: false,
    opened: false,
    unread: true,
  })
}

export const update = (chatId: string, id: string, data) => {
  return createBaseMethods(db.getChatConversations(`chats/${chatId}/conversation`)).update(id, data)
}

export const archive = (chatId: string, id: string, data) => {
  return createBaseMethods(db.getChatConversations(`chats/${chatId}/conversation`)).archive(
    id,
    data
  )
}

export const unarchive = (chatId: string, id: string, data) => {
  return createBaseMethods(db.getChatConversations(`chats/${chatId}/conversation`)).unarchive(
    id,
    data
  )
}

export const findAllChatMessages = async (chatId: string) => {
  return createBaseMethods(db.getChatConversations(`chats/${chatId}/conversation`)).findAll()
}

export const findChatMessage = async (chatId: string, id: string) => {
  return createBaseMethods(db.getChatConversations(`chats/${chatId}/conversation`)).findById(id)
}

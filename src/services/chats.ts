import { db } from './firebase'

type GetChatsParamTypes = {
  userId: string
  limit?: number
  order?: 'asc' | 'desc'
}

type GetChatConversationParamTypes = {
  chatId: string
  order?: 'asc' | 'desc'
  limit?: number
}

export const getChats = ({ userId, limit = 10, order = 'desc' }: GetChatsParamTypes) => {
  return db
    .collection('chats')
    .where('members', 'array-contains', userId)
    .orderBy('last_message.created_at', order)
    .limit(limit)
}

export const getChatConversation = ({
  chatId,
  order = 'desc',
  limit = 10,
}: GetChatConversationParamTypes) => {
  return db
    .collection('chats')
    .doc(chatId)
    .collection('conversation')
    .where('archived', '==', false)
    .orderBy('created_at', order)
    .limit(limit)
}

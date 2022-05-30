import { API_URL } from '../config/variables'
import { Chat, Conversation } from '../models'
import { db } from '../utils'
import { SortOrderType, ChatSortByType } from '../utils/types'

export type ChatFilterType = {
  chatType: 'all' | 'user' | 'shop' | 'product' | 'group'
  archived?: boolean
}

export type ChatSort = {
  sortBy: ChatSortByType
  sortOrder: SortOrderType
}

export type ConversationSort = {
  sortBy: 'created_at'
  sortOrder: SortOrderType
}

type GetChatsParamTypes = {
  search?: string
  filter?: ChatFilterType
  sort?: ChatSort
  limit?: number
  page?: number
  user: string
}

type GetConversationsParamTypes = {
  search?: string
  sort?: ConversationSort
  limit?: number
  page?: number
  chat: string
}

export type ChatsResponse = {
  pages: number
  totalItems: number
  data: (Chat & { id: string })[]
}

export type ConversationsResponse = {
  pages: number
  totalItems: number
  data: (Conversation & { id: string })[]
}

export const getConversationById = async (chatId: string, conversationId: string) => {
  return db.getChatConversations(`chats/${chatId}/conversation`).doc(conversationId).get()
}

export const getChats = async (
  {
    search = '',
    filter = { chatType: 'all', archived: false },
    sort = { sortBy: 'updated_at', sortOrder: 'desc' },
    limit = 10,
    page = 0,
    user,
  }: GetChatsParamTypes,
  firebaseToken: string
): Promise<ChatsResponse | undefined> => {
  let params: any = {
    limit,
    page,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    user,
  }
  if (search) {
    params.q = search
  }
  if (filter.chatType !== 'all') {
    params.chatType = filter.chatType
  }
  const searchParams = new URLSearchParams(params)
  if (API_URL) {
    const res = await (
      await fetch(`${API_URL}/chats?${searchParams}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firebaseToken}`,
        },
        method: 'get',
      })
    ).json()
    return res
  }

  console.error('environment variable for the api does not exist.')
}

export const getChatConversation = async (
  {
    search = '',
    sort = { sortBy: 'created_at', sortOrder: 'desc' },
    limit = 10,
    page = 0,
    chat,
  }: GetConversationsParamTypes,
  firebaseToken: string
): Promise<ConversationsResponse | undefined> => {
  let params: any = {
    limit,
    page,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    chat,
  }
  if (search) {
    params.q = search
  }
  const searchParams = new URLSearchParams(params)
  if (API_URL) {
    const res = await (
      await fetch(`${API_URL}/conversations?${searchParams}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firebaseToken}`,
        },
        method: 'get',
      })
    ).json()
    return res
  }

  console.error('environment variable for the api does not exist.')
}

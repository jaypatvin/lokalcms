import { API_URL } from '../config/variables'
import { Chat } from '../models'
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

type GetChatsParamTypes = {
  search?: string
  filter?: ChatFilterType
  sort?: ChatSort
  limit?: number
  page?: number
  user: string
}

type GetChatConversationParamTypes = {
  chatId: string
  order?: 'asc' | 'desc'
  limit?: number
}

export type ChatsResponse = {
  pages: number
  totalItems: number
  data: (Chat & { id: string })[]
}

export const getChatConversation = ({
  chatId,
  order = 'desc',
  limit = 10,
}: GetChatConversationParamTypes) => {
  return db
    .getChatConversations(`chats/${chatId}/conversation`)
    .where('archived', '==', false)
    .orderBy('created_at', order)
    .limit(limit)
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

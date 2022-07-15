import { DocumentReference, Timestamp, CollectionReference } from 'firebase/firestore'
import Conversation from '../Conversation'

type Chat = {
  archived: boolean
  chat_type: 'user' | 'shop' | 'product' | 'group'
  community_id: string
  conversation?: CollectionReference<Conversation>
  created_at: Timestamp
  group_hash?: string
  last_message: {
    content: string
    conversation_id?: string
    created_at: Timestamp
    ref?: DocumentReference<Conversation>
    sender: string
    sender_id: string
  }
  members: string[]
  shop_id?: string
  product_id?: string
  customer_name?: string
  title: string
  updated_at?: Timestamp
  updated_by?: string
  updated_from?: '' | 'cms' | 'app'
}

export type ChatCreateData = Pick<
  Chat,
  | 'title'
  | 'members'
  | 'community_id'
  | 'archived'
  | 'last_message'
  | 'chat_type'
  | 'shop_id'
  | 'product_id'
  | 'customer_name'
  | 'group_hash'
>

export type ChatUpdateData = Partial<Pick<Chat, 'updated_by' | 'updated_from' | 'title' | 'last_message'>>

export default Chat

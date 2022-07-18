import { DocumentReference, Timestamp } from "firebase/firestore"

type Conversation = {
  archived: boolean
  chat_id: string
  community_id: string
  created_at: Timestamp
  media?: {
    order: number
    type: 'image' | 'video'
    url: string
  }[]
  message?: string
  sender_id: string
  sent_at: Timestamp
  reply_to?: DocumentReference<Conversation>
}

export type ConversationCreateData = Pick<
  Conversation,
  | 'sender_id'
  | 'sent_at'
  | 'archived'
  | 'message'
  | 'media'
  | 'reply_to'
  | 'chat_id'
  | 'community_id'
>

export default Conversation

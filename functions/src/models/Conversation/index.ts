type Conversation = {
  archived: boolean
  created_at: FirebaseFirestore.Timestamp
  media?: {
    order: number
    type: 'image' | 'video'
    url: string
  }[]
  message?: string
  sender_id: string
  sent_at: FirebaseFirestore.Timestamp
  reply_to?: FirebaseFirestore.DocumentReference<Conversation>
}

export type ConversationCreateData = Pick<
  Conversation,
  'sender_id' | 'sent_at' | 'archived' | 'message' | 'media' | 'reply_to'
>

export default Conversation

type Conversation = {
  archived: boolean
  created_at: firebase.default.firestore.Timestamp
  media?: {
    order: number
    type: 'image' | 'video'
    url: string
  }[]
  message?: string
  sender_id: string
  sent_at: firebase.default.firestore.Timestamp
  reply_to?: firebase.default.firestore.DocumentReference<Conversation>
}

export type ConversationCreateData = Pick<
  Conversation,
  'sender_id' | 'sent_at' | 'archived' | 'message' | 'media' | 'reply_to'
>

export default Conversation

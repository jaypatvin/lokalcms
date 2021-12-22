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
}

export default Conversation

import Conversation from '../Conversation'

type Chat = {
  archived: boolean
  chat_type: 'user' | 'shop' | 'product' | 'group'
  community_id: string
  conversation: FirebaseFirestore.CollectionGroup<Conversation>
  created_at: FirebaseFirestore.Timestamp
  group_hash?: string
  last_message: {
    content: string
    conversation_id: string
    created_at: FirebaseFirestore.Timestamp
    ref: FirebaseFirestore.DocumentReference<Conversation>
    sender: string
    sender_id: string
  }
  members: string[]
  title: string
  updated_at?: FirebaseFirestore.Timestamp
}

export default Chat

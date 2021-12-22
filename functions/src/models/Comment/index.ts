type Comment = {
  archived: boolean
  created_at: FirebaseFirestore.Timestamp
  message: string
  status: 'enabled' | 'disabled'
  updated_at?: FirebaseFirestore.Timestamp
  updated_by?: string
  updated_from?: '' | 'cms' | 'app'
  user_id: string
}

export default Comment

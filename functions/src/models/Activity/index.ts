type Activity = {
  _meta: {
    comments_count: number
    likes_count: number
  }
  archived: boolean
  community_id: string
  created_at: FirebaseFirestore.Timestamp
  message: string
  status: 'enabled' | 'disabled'
  updated_at?: FirebaseFirestore.Timestamp
  updated_by?: string
  updated_from?: '' | 'cms' | 'app'
  user_id: string
}

export default Activity

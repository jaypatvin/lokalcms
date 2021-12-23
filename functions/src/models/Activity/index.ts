import { Like, Comment } from '../'

type Activity = {
  _meta: {
    comments_count: number
    likes_count: number
  }
  archived: boolean
  comments: FirebaseFirestore.CollectionGroup<Comment>
  community_id: string
  created_at: FirebaseFirestore.Timestamp
  likes: FirebaseFirestore.CollectionGroup<Like>
  message: string
  status: 'enabled' | 'disabled'
  updated_at?: FirebaseFirestore.Timestamp
  updated_by?: string
  updated_from?: '' | 'cms' | 'app'
  user_id: string
}

export default Activity

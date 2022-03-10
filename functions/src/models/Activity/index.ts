import { Like, Comment } from '../'

type Activity = {
  _meta?: {
    comments_count?: number
    likes_count?: number
  }
  archived: boolean
  comments?: FirebaseFirestore.CollectionGroup<Comment>
  community_id: string
  created_at: FirebaseFirestore.Timestamp
  images?: {
    url: string
    order: number
  }[]
  likes?: FirebaseFirestore.CollectionGroup<Like>
  message: string
  status: 'enabled' | 'disabled'
  updated_at?: FirebaseFirestore.Timestamp
  updated_by?: string
  updated_from?: '' | 'cms' | 'app'
  user_id: string
}

export type ActivityCreateData = Pick<
  Activity,
  | 'message'
  | 'user_id'
  | 'community_id'
  | 'status'
  | 'archived'
  | 'updated_by'
  | 'updated_from'
  | 'images'
>

export type ActivityUpdateData = Partial<
  Pick<Activity, 'status' | 'message' | 'updated_by' | 'updated_from'>
>

export default Activity

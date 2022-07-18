import { Timestamp } from 'firebase/firestore'

type Comment = {
  archived: boolean
  activity_id: string
  created_at: Timestamp
  images?: {
    url: string
    order: number
  }[]
  message: string
  status: 'enabled' | 'disabled'
  updated_at?: Timestamp
  updated_content_at?: Timestamp
  updated_by?: string
  updated_from?: '' | 'cms' | 'app'
  user_id: string
}

export type CommentCreateData = Pick<
  Comment,
  'message' | 'user_id' | 'status' | 'archived' | 'images' | 'activity_id'
>

export type CommentUpdateData = Partial<Pick<Comment, 'message'>>

export default Comment

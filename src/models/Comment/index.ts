type Comment = {
  activity_id: string
  archived: boolean
  created_at: firebase.default.firestore.Timestamp
  images?: {
    url: string
    order: number
  }[]
  message: string
  status: 'enabled' | 'disabled'
  updated_at?: firebase.default.firestore.Timestamp
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

type Comment = {
  archived: boolean
  created_at: FirebaseFirestore.Timestamp
  images?: {
    url: string
    order: number
  }[]
  message: string
  status: 'enabled' | 'disabled'
  updated_at?: FirebaseFirestore.Timestamp
  updated_by?: string
  updated_from?: '' | 'cms' | 'app'
  user_id: string
}

export type CommentCreateData = Pick<
  Comment,
  'message' | 'user_id' | 'status' | 'archived' | 'images'
>

export type CommentUpdateData = Partial<Pick<Comment, 'message'>>

export default Comment
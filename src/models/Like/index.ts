type Like = {
  activity_id?: string
  comment_id?: string
  shop_id?: string
  product_id?: string
  created_at: FirebaseFirestore.Timestamp
  parent_collection_name: string
  parent_collection_path: string
  user_id: string
}

export type LikeCreateData = Pick<
  Like,
  | 'activity_id'
  | 'comment_id'
  | 'shop_id'
  | 'product_id'
  | 'parent_collection_name'
  | 'parent_collection_path'
>

export default Like

type Review = {
  user_id: string
  message: string
  order_id: string
  product_id: string
  shop_id: string
  community_id: string
  seller_id: string
  created_at: firebase.default.firestore.Timestamp
  updated_at?: firebase.default.firestore.Timestamp
  rating: 1 | 2 | 3 | 4 | 5
}

export type ReviewCreateData = Pick<
  Review,
  | 'user_id'
  | 'message'
  | 'rating'
  | 'order_id'
  | 'product_id'
  | 'shop_id'
  | 'community_id'
  | 'seller_id'
>

export type ReviewUpdateData = Partial<Pick<Review, 'rating' | 'message'>>

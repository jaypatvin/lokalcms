type Review = {
  user_id: string
  message: string
  order_id: string
  product_id: string
  created_at: FirebaseFirestore.Timestamp
  updated_at?: FirebaseFirestore.Timestamp
  rating: 1 | 2 | 3 | 4 | 5
}

export type ReviewCreateData = Pick<
  Review,
  'user_id' | 'message' | 'rating' | 'order_id' | 'product_id'
>

export type ReviewUpdateData = Partial<Pick<Review, 'rating' | 'message'>>

export default Review

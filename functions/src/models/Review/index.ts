type Review = {
  user_id: string
  message: string
  order_id: string
  created_at: FirebaseFirestore.Timestamp
  updated_at?: FirebaseFirestore.Timestamp
  rating: 1 | 2 | 3 | 4 | 5
}

export default Review

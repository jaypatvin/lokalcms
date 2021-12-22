type ProductSubscription = {
  buyer_id: string
  confirmed_by_buyer: boolean
  confirmed_by_seller: boolean
  created_at: FirebaseFirestore.Timestamp
  date: FirebaseFirestore.Timestamp
  date_string: string
  instruction: string
  original_date: FirebaseFirestore.Timestamp
  product_subscription_plan_id: string
  quantity: number
  seller_id: string
  skip: boolean
}

export default ProductSubscription

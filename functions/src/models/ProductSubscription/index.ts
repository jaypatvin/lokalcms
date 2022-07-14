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

export type ProductSubscriptionCreateData = Pick<
  ProductSubscription,
  | 'buyer_id'
  | 'seller_id'
  | 'product_subscription_plan_id'
  | 'quantity'
  | 'confirmed_by_buyer'
  | 'confirmed_by_seller'
  | 'skip'
  | 'instruction'
  | 'date'
  | 'date_string'
  | 'original_date'
>

export default ProductSubscription

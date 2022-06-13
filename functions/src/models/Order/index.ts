type Order = {
  buyer_id: string
  community_id: string
  created_at: FirebaseFirestore.Timestamp
  delivery_address: {
    barangay: string
    city: string
    country: string
    state: string
    street: string
    subdivision: string
    zip_code: string
  }
  delivery_date: FirebaseFirestore.Timestamp
  delivered_date?: FirebaseFirestore.Timestamp
  delivery_option: 'delivery' | 'pickup'
  instruction: string
  is_paid: boolean
  payment_method?: 'bank' | 'cod'
  product_ids: string[]
  products: {
    instruction: string
    category?: string
    description: string
    id: string
    image: string
    name: string
    price: number
    quantity: number
    review_id?: string
  }[]
  proof_of_payment?: string
  seller_id: string
  shop_id: string
  shop: {
    description: string
    image?: string
    name: string
  }
  status_code: number | string
  updated_at?: FirebaseFirestore.Timestamp
  updated_by?: string
  updated_from?: '' | 'cms' | 'app'
  cancellation_reason?: string
  decline_reason?: string
  product_subscription_id?: string
  product_subscription_date?: string
}

export type OrderCreateData = Pick<
  Order,
  | 'products'
  | 'product_ids'
  | 'buyer_id'
  | 'shop_id'
  | 'seller_id'
  | 'community_id'
  | 'delivery_date'
  | 'delivery_option'
  | 'instruction'
  | 'is_paid'
  | 'status_code'
  | 'shop'
  | 'delivery_address'
  | 'product_subscription_id'
  | 'product_subscription_date'
  | 'payment_method'
>

export type OrderUpdateData = Partial<
  Pick<
    Order,
    | 'updated_by'
    | 'updated_from'
    | 'status_code'
    | 'is_paid'
    | 'decline_reason'
    | 'proof_of_payment'
    | 'delivered_date'
    | 'payment_method'
    | 'products'
  >
>

export default Order

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
  delivered_date: FirebaseFirestore.Timestamp
  delivery_option: 'delivery' | 'pickup'
  instruction: string
  is_paid: boolean
  payment_method: 'bank' | 'cod'
  product_ids: string[]
  products: {
    instruction: string
    product_category: string
    product_description: string
    product_id: string
    product_image: string
    product_name: string
    product_price: number
    quantity: number
  }[]
  proof_of_payment: string
  seller_id: string
  shop_description: string
  shop_id: string
  shop_image: string
  shop_name: string
  status_code: number | string
  updated_at?: FirebaseFirestore.Timestamp
  updated_by?: string
  updated_from?: '' | 'cms' | 'app'
}

export default Order

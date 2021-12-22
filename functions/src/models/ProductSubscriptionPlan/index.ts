type ProductSubscriptionPlan = {
  archived: boolean
  buyer_id: string
  community_id: string
  created_at: FirebaseFirestore.Timestamp
  instruction: string
  payment_method: 'bank' | 'cod'
  plan: {
    auto_reschedule: boolean
    last_date: string
    override_dates: {
      [x: string]: string
    }
    repeat_type:
      | 'day'
      | 'week'
      | 'month'
      | '1-mon'
      | '1-tue'
      | '1-wed'
      | '1-thu'
      | '1-fri'
      | '1-sat'
      | '1-sun'
      | '1-mon'
      | '2-tue'
      | '2-wed'
      | '2-thu'
      | '2-fri'
      | '2-sat'
      | '2-sun'
      | '3-mon'
      | '3-tue'
      | '3-wed'
      | '3-thu'
      | '3-fri'
      | '3-sat'
      | '3-sun'
      | '4-mon'
      | '4-tue'
      | '4-wed'
      | '4-thu'
      | '4-fri'
      | '4-sat'
      | '4-sun'
      | '5-mon'
      | '5-tue'
      | '5-wed'
      | '5-thu'
      | '5-fri'
      | '5-sat'
      | '5-sun'
    repeat_unit: number
    schedule: {
      mon?: {
        start_date: string
      }
      tue?: {
        start_date: string
      }
      wed?: {
        start_date: string
      }
      thu?: {
        start_date: string
      }
      fri?: {
        start_date: string
      }
      sat?: {
        start_date: string
      }
      sun?: {
        start_date: string
      }
    }
    start_dates: string[]
  }
  product: {
    description: string
    image: string
    name: string
    price: number
  }
  product_id: string
  quantity: number
  seller_id: string
  shop: {
    description: string
    image: string
    name: string
  }
  shop_id: string
  status: 'enabled' | 'disabled'
  updated_at?: FirebaseFirestore.Timestamp
}

export default ProductSubscriptionPlan

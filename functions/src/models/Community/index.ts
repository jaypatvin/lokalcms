type Community = {
  _meta: {
    orders_count: number
    product_subscription_plans_count: number
    shops_count: number
  }
  address: {
    barangay: string
    city: string
    country: string
    state: string
    subdivision: string
    zip_code: string
  }
  admin: string[]
  archived: boolean
  cover_photo: string
  created_at: FirebaseFirestore.Timestamp
  keywords: string[]
  name: string
  profile_photo: string
  updated_at: FirebaseFirestore.Timestamp
}

export default Community

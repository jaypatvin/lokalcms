type Community = {
  _meta?: {
    orders_count?: number
    product_subscription_plans_count?: number
    shops_count?: number
  }
  address: {
    barangay: string
    city: string
    country: string
    state: string
    subdivision: string
    zip_code: string
  }
  admin?: string[]
  archived: boolean
  cover_photo?: string
  created_at: FirebaseFirestore.Timestamp
  keywords: string[]
  name: string
  profile_photo?: string
  updated_at?: FirebaseFirestore.Timestamp
  updated_by?: string
  updated_from?: '' | 'cms' | 'app'
}

export type CommunityCreateData = Pick<
  Community,
  | 'name'
  | 'address'
  | 'admin'
  | 'keywords'
  | 'archived'
  | 'updated_by'
  | 'updated_from'
  | 'profile_photo'
  | 'cover_photo'
>

export type CommunityUpdateData = Partial<
  Pick<
    Community,
    | 'updated_by'
    | 'updated_from'
    | 'keywords'
    | 'name'
    | 'profile_photo'
    | 'cover_photo'
    | 'address'
    | 'admin'
  >
>

export default Community

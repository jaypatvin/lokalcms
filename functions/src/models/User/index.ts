import { Community, Notification } from '../index'

type User = {
  _meta?: {
    products_count?: number
    shops_count?: number
    orders_as_buyer_count?: number
    orders_as_seller_count?: number
    product_subscription_plans_as_buyer_count?: number
    product_subscription_plans_as_seller_count?: number
    reviews_count?: number
    likes_count?: number
  }
  address: {
    barangay: string
    city: string
    country: string
    state: string
    street: string
    subdivision: string
    zip_code: string
  }
  archived: boolean
  birthdate: string
  chat_settings?: {
    show_read_receipts?: boolean
  }
  community: FirebaseFirestore.DocumentReference<Community>
  community_id: string
  created_at: FirebaseFirestore.Timestamp
  display_name: string
  email: string
  first_name: string
  id?: string
  keywords: string[]
  last_name: string
  notifications?: FirebaseFirestore.CollectionGroup<Notification>
  notification_settings?: {
    likes?: boolean
    comments?: boolean
    tags?: boolean
    messages?: boolean
    order_status?: boolean
    community_alerts?: boolean
    subscriptions?: boolean
  }
  profile_photo?: string
  registration: {
    id_photo: string
    id_type: string
    notes: string
    step: number
    verified: boolean
  }
  roles: {
    admin: boolean
    member: boolean
    editor?: boolean
  }
  status: 'active' | 'away' | 'disabled' | 'archived'
  updated_at?: FirebaseFirestore.Timestamp
  updated_by?: string
  updated_from?: '' | 'cms' | 'app'
  user_uids: string[]
}

export type UserCreateData = Pick<
  User,
  | 'user_uids'
  | 'first_name'
  | 'last_name'
  | 'display_name'
  | 'email'
  | 'roles'
  | 'status'
  | 'birthdate'
  | 'registration'
  | 'community_id'
  | 'community'
  | 'address'
  | 'keywords'
  | 'archived'
  | 'updated_by'
  | 'updated_from'
  | 'profile_photo'
>

export type UserUpdateData = Partial<
  Pick<
    User,
    | 'address'
    | 'community'
    | 'community_id'
    | 'birthdate'
    | 'display_name'
    | 'first_name'
    | 'last_name'
    | 'profile_photo'
    | 'registration'
    | 'roles'
    | 'status'
    | 'updated_by'
    | 'updated_from'
    | 'keywords'
  >
>

export default User

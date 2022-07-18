import { Timestamp } from 'firebase/firestore'
import { Like, Report } from '../'

type Shop = {
  _meta?: {
    orders_count?: number
    products_count?: number
    product_subscription_plans_count?: number
    reports_count?: number
    likes_count?: number
  }
  likes?: FirebaseFirestore.CollectionGroup<Like>
  reports?: FirebaseFirestore.CollectionGroup<Report>
  archived: boolean
  community_id: string
  cover_photo?: string
  created_at: Timestamp
  description: string
  is_close: boolean
  keywords: string[]
  name: string
  operating_hours: {
    end_time: string
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
      custom?: {
        [x: string]: {
          unavailable?: boolean
          start_time?: string
          end_time?: string
        } | any
      }
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
    start_time: string
  }
  payment_options?: {
    bank_code: 'bdo' | 'bpi' | 'unionbank' | 'paymaya' | 'gcash'
    type: 'bank' | 'wallet'
    account_number: string
    account_name: string
  }[]
  delivery_options: {
    delivery: boolean
    pickup: boolean
  }
  profile_photo?: string
  status: 'enabled' | 'disabled'
  updated_at?: Timestamp
  updated_by?: string
  updated_from?: '' | 'cms' | 'app'
  user_id: string
}

export type ShopCreateData = Pick<
  Shop,
  | 'name'
  | 'description'
  | 'user_id'
  | 'community_id'
  | 'is_close'
  | 'status'
  | 'keywords'
  | 'archived'
  | 'updated_by'
  | 'updated_from'
  | 'operating_hours'
  | 'profile_photo'
  | 'cover_photo'
  | 'payment_options'
  | 'delivery_options'
>

export type ShopUpdateData = Partial<
  Pick<
    Shop,
    | 'name'
    | 'keywords'
    | 'description'
    | 'is_close'
    | 'profile_photo'
    | 'cover_photo'
    | 'payment_options'
    | 'updated_by'
    | 'updated_from'
    | 'operating_hours'
    | 'delivery_options'
  >
>

export default Shop

import { Like, Review, Wishlist } from '../'

type Product = {
  _meta?: {
    average_rating?: number
    likes_count?: number
    wishlists_count?: number
    reviews_count?: number
  }
  likes?: FirebaseFirestore.CollectionGroup<Like>
  wishlists?: FirebaseFirestore.CollectionGroup<Wishlist>
  reviews?: FirebaseFirestore.CollectionGroup<Review>
  archived: boolean
  availability: {
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
        }
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
  base_price: number
  can_subscribe: boolean
  community_id: string
  created_at: FirebaseFirestore.Timestamp
  description: string
  gallery?: {
    order: number
    url: string
  }[]
  keywords: string[]
  name: string
  product_category: string
  quantity: number
  shop_id: string
  status: 'enabled' | 'disabled'
  updated_at?: FirebaseFirestore.Timestamp
  updated_by?: string
  updated_from?: '' | 'cms' | 'app'
  user_id: string
}

export type ProductCreateData = Pick<
  Product,
  | 'name'
  | 'description'
  | 'shop_id'
  | 'user_id'
  | 'community_id'
  | 'base_price'
  | 'quantity'
  | 'product_category'
  | 'status'
  | 'keywords'
  | 'archived'
  | 'updated_by'
  | 'updated_from'
  | 'can_subscribe'
  | 'availability'
  | 'gallery'
>

export type ProductUpdateData = Partial<
  Pick<
    Product,
    | 'name'
    | 'description'
    | 'base_price'
    | 'quantity'
    | 'gallery'
    | 'product_category'
    | 'status'
    | 'can_subscribe'
    | 'updated_by'
    | 'updated_from'
    | 'keywords'
    | 'availability'
  >
>

export default Product

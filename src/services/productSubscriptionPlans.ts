import { SortOrderType } from '../utils/types'
import { db } from './firebase'

type GetProductSubscriptionPlansParamTypes = {
  community_id: string
  product_id?: string
  shop_id?: string
  buyer_id?: string
  seller_id?: string
  limit?: number
  sortOrder?: SortOrderType
}

export const getProductSubscriptionPlansByBuyer = (user_id: string, limit = 10) => {
  return db
    .collection('product_subscription_plans')
    .where('buyer_id', '==', user_id)
    .orderBy('created_at', 'desc')
    .limit(limit)
}

export const getProductSubscriptionPlansBySeller = (user_id: string, limit = 10) => {
  return db
    .collection('product_subscription_plans')
    .where('seller_id', '==', user_id)
    .orderBy('created_at', 'desc')
    .limit(limit)
}

export const getProductSubscriptionPlans = ({
  community_id,
  product_id,
  shop_id,
  buyer_id,
  seller_id,
  limit = 10,
  sortOrder = 'desc',
}: GetProductSubscriptionPlansParamTypes) => {
  let ref = db.collection('product_subscription_plans').where('community_id', '==', community_id)
  if (shop_id) {
    ref = ref.where('shop_id', '==', shop_id)
  }
  if (product_id) {
    ref = ref.where('product_id', '==', product_id)
  }
  if (buyer_id) {
    ref = ref.where('buyer_id', '==', buyer_id)
  }
  if (seller_id) {
    ref = ref.where('seller_id', '==', seller_id)
  }
  ref = ref.orderBy('created_at', sortOrder).limit(limit)

  return ref
}

import { SortOrderType } from '../utils/types'
import { db } from '../utils'

export type ProductSubscriptionPlanFilterType = {
  status: string
  paymentMethod: 'all' | 'bank' | 'cod'
}

export type ProductSubscriptionPlanSort = {
  sortBy: 'created_at' | 'updated_at'
  sortOrder: SortOrderType
}

type GetProductSubscriptionPlansParamTypes = {
  communityId: string
  productId?: string
  shopId?: string
  buyerId?: string
  sellerId?: string
  limit?: number
  filter?: ProductSubscriptionPlanFilterType
  sort?: ProductSubscriptionPlanSort
}

export const getProductSubscriptionPlansByBuyer = (user_id: string, limit = 10) => {
  return db.productSubscriptionPlans
    .where('buyer_id', '==', user_id)
    .orderBy('created_at', 'desc')
    .limit(limit)
}

export const getProductSubscriptionPlansBySeller = (user_id: string, limit = 10) => {
  return db.productSubscriptionPlans
    .where('seller_id', '==', user_id)
    .orderBy('created_at', 'desc')
    .limit(limit)
}

export const getProductSubscriptionPlansByCommunity = (community_id: string, limit = 10) => {
  return db.productSubscriptionPlans
    .where('community_id', '==', community_id)
    .orderBy('created_at', 'desc')
    .limit(limit)
}

export const getProductSubscriptionPlansByShop = (shop_id: string, limit = 10) => {
  return db.productSubscriptionPlans
    .where('shop_id', '==', shop_id)
    .orderBy('created_at', 'desc')
    .limit(limit)
}

export const getProductSubscriptionPlans = ({
  communityId,
  productId,
  shopId,
  buyerId,
  sellerId,
  limit = 10,
  filter = {
    status: 'all',
    paymentMethod: 'all',
  },
  sort = { sortBy: 'created_at', sortOrder: 'desc' },
}: GetProductSubscriptionPlansParamTypes) => {
  let ref = db.productSubscriptionPlans.where('community_id', '==', communityId)
  if (filter.status !== 'all') {
    ref = ref.where('status', '==', filter.status)
  }
  if (filter.paymentMethod !== 'all') {
    ref = ref.where('payment_method', '==', filter.paymentMethod)
  }
  if (shopId) {
    ref = ref.where('shop_id', '==', shopId)
  }
  if (productId) {
    ref = ref.where('product_id', '==', productId)
  }
  if (buyerId) {
    ref = ref.where('buyer_id', '==', buyerId)
  }
  if (sellerId) {
    ref = ref.where('seller_id', '==', sellerId)
  }
  ref = ref.orderBy(sort.sortBy, sort.sortOrder).limit(limit)

  return ref
}

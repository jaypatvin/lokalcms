import { isString } from 'lodash'
import { SortOrderType } from '../utils/types'
import { db } from '../utils'

export type OrderFilterType = {
  statusCode: 'all' | number | string
  isPaid: 'all' | boolean
  deliveryOption: 'all' | 'pickup' | 'delivery'
  paymentMethod: 'all' | 'bank' | 'cod'
}

export type OrderSort = {
  sortBy: 'created_at' | 'updated_at'
  sortOrder: SortOrderType
}

type GetOrdersParamTypes = {
  communityId: string
  productId?: string
  shopId?: string
  filter?: OrderFilterType
  limit?: number
  sort?: OrderSort
}

export const fetchOrderByID = async (id: string) => {
  return db.orders.doc(id).get()
}

export const fetchOrderByProductSubscription = async (id: string) => {
  return db.orders.where('product_subscription_id', '==', id).get()
}

export const getOrdersByBuyer = (user_id: string, limit = 10) => {
  return db.orders.where('buyer_id', '==', user_id).orderBy('created_at', 'desc').limit(limit)
}

export const getOrdersBySeller = (user_id: string, limit = 10) => {
  return db.orders.where('seller_id', '==', user_id).orderBy('created_at', 'desc').limit(limit)
}

export const getOrdersByCommunity = (community_id: string, limit = 10) => {
  return db.orders
    .where('community_id', '==', community_id)
    .orderBy('created_at', 'desc')
    .limit(limit)
}

export const getOrdersByShop = (shop_id: string, limit = 10) => {
  return db.orders.where('shop_id', '==', shop_id).orderBy('created_at', 'desc').limit(limit)
}

export const getOrders = ({
  communityId,
  productId,
  shopId,
  filter = {
    statusCode: 'all',
    isPaid: 'all',
    deliveryOption: 'all',
    paymentMethod: 'all',
  },
  limit = 10,
  sort = { sortBy: 'created_at', sortOrder: 'desc' },
}: GetOrdersParamTypes) => {
  let ref = db.orders.where('community_id', '==', communityId)
  if (filter.statusCode !== 'all') {
    const code = isString(filter.statusCode) ? parseInt(filter.statusCode) : filter.statusCode
    ref = ref.where('status_code', '==', code)
  }
  if (filter.isPaid !== 'all') {
    ref = ref.where('is_paid', '==', filter.isPaid)
  }
  if (filter.deliveryOption !== 'all') {
    ref = ref.where('delivery_option', '==', filter.deliveryOption)
  }
  if (filter.paymentMethod !== 'all') {
    ref = ref.where('payment_method', '==', filter.paymentMethod)
  }
  if (shopId) {
    ref = ref.where('shop_id', '==', shopId)
  }
  if (productId) {
    ref = ref.where('product_ids', 'array-contains', productId)
  }
  ref = ref.orderBy(sort.sortBy, sort.sortOrder).limit(limit)

  return ref
}

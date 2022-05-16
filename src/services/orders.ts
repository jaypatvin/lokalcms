import { isString } from 'lodash'
import { SortOrderType } from '../utils/types'
import { db } from '../utils'
import { API_URL } from '../config/variables'
import { Order } from '../models/types'

export type OrderFilterType = {
  statusCode: 'all' | number | string
  isPaid: 'all' | boolean
  deliveryOption: 'all' | 'pickup' | 'delivery'
  paymentMethod: 'all' | 'bank' | 'cod'
}

export type OrderSort = {
  sortBy: 'created_at'
  sortOrder: SortOrderType
}

type GetOrdersParamTypes = {
  communityId: string
  productId?: string
  shopId?: string
  filter?: OrderFilterType
  limit?: number
  page?: number
  sort?: OrderSort
  search?: string
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

export type OrdersResponse = {
  pages: number
  totalItems: number
  data: (Order & { id: string })[]
}

export const getOrders = async (
  {
    search = '',
    filter = {
      statusCode: 'all',
      isPaid: 'all',
      deliveryOption: 'all',
      paymentMethod: 'all',
    },
    sort = { sortBy: 'created_at', sortOrder: 'asc' },
    limit = 10,
    page = 0,
    communityId,
    productId,
    shopId,
  }: GetOrdersParamTypes,
  firebaseToken: string
): Promise<OrdersResponse | undefined> => {
  let params: any = {
    limit,
    page,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
  }
  if (search) {
    params.q = search
  }
  if (communityId) {
    params.community = communityId
  }
  if (filter.statusCode !== 'all') {
    params.status = filter.statusCode
  }
  if (filter.isPaid !== 'all') {
    params.isPaid = filter.isPaid
  }
  if (filter.deliveryOption !== 'all') {
    params.deliveryOption = filter.deliveryOption
  }
  if (filter.paymentMethod !== 'all') {
    params.paymentMethod = filter.paymentMethod
  }
  if (shopId) {
    params.shopId = shopId
  }
  if (productId) {
    params.productId = productId
  }
  const searchParams = new URLSearchParams(params)
  if (API_URL) {
    const res = await (
      await fetch(`${API_URL}/orders?${searchParams}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firebaseToken}`,
        },
        method: 'get',
      })
    ).json()
    return res
  }

  console.error('environment variable for the api does not exist.')
}

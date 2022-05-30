import { SortOrderType } from '../utils/types'
import { db } from '../utils'
import { API_URL } from '../config/variables'
import { ProductSubscriptionPlan } from '../models'

export type ProductSubscriptionPlanFilterType = {
  status: string
  paymentMethod: 'all' | 'bank' | 'cod'
}

export type ProductSubscriptionPlanSort = {
  sortBy: 'created_at' | 'updated_at'
  sortOrder: SortOrderType
}

type GetProductSubscriptionPlansParamTypes = {
  search?: string
  communityId: string
  productId?: string
  shopId?: string
  buyerId?: string
  sellerId?: string
  limit?: number
  page?: number
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

export type ProductSubscriptionPlansResponse = {
  pages: number
  totalItems: number
  data: (ProductSubscriptionPlan & { id: string })[]
}

export const getProductSubscriptionPlans = async (
  {
    search = '',
    filter = {
      status: 'all',
      paymentMethod: 'all',
    },
    sort = { sortBy: 'created_at', sortOrder: 'asc' },
    limit = 10,
    page = 0,
    communityId,
    productId,
    shopId,
    buyerId,
    sellerId,
  }: GetProductSubscriptionPlansParamTypes,
  firebaseToken: string
): Promise<ProductSubscriptionPlansResponse | undefined> => {
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
  if (filter.status !== 'all') {
    params.status = filter.status
  }
  if (filter.paymentMethod !== 'all') {
    params.paymentMethod = filter.paymentMethod
  }
  if (shopId) {
    params.shop = shopId
  }
  if (productId) {
    params.product = productId
  }
  if (buyerId) {
    params.buyer = buyerId
  }
  if (sellerId) {
    params.seller = sellerId
  }
  const searchParams = new URLSearchParams(params)
  if (API_URL) {
    const res = await (
      await fetch(`${API_URL}/productSubscriptionPlans?${searchParams}`, {
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

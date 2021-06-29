import { SortOrderType } from '../utils/types'
import { db } from './firebase'

type GetOrdersParamTypes = {
  community_id: string
  product_id?: string
  shop_id?: string
  status_code?: number
  limit?: number
  sortOrder?: SortOrderType
}

export const fetchOrderByID = async (id: string) => {
  return db.collection('orders').doc(id).get()
}

export const getOrders = ({
  community_id,
  product_id,
  shop_id,
  status_code,
  limit = 10,
  sortOrder = 'desc',
}: GetOrdersParamTypes) => {
  let ref = db.collection('orders').where('community_id', '==', community_id)
  if (status_code) {
    ref = ref.where('status_code', '==', status_code)
  }
  if (shop_id) {
    ref = ref.where('shop_id', '==', shop_id)
  }
  if (product_id) {
    ref = ref.where('product_ids', 'array-contains', product_id)
  }
  ref = ref.orderBy('created_at', sortOrder).limit(limit)

  return ref
}
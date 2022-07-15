import { where } from 'firebase/firestore'
import { OrderCreateData, OrderUpdateData } from '../models/Order'
import db from '../utils/db'
import { createBaseMethods } from './base'

const {
  findAll,
  findById,
  findByCommunityId,
  create: baseCreate,
  update: baseUpdate,
} = createBaseMethods(db.orders)

export { findAll, findByCommunityId, findById }

export const create = (data: OrderCreateData) => baseCreate(data)
export const update = (id: string, data: OrderUpdateData) => baseUpdate(id, data)

export const findOrdersByBuyerId = async (id: string) => {
  return await findAll({
    wheres: [where('buyer_id', '==', id)],
  })
}

export const findOrdersByProductSubscriptionIdAndDate = async (id: string, date: string) => {
  return await findAll({
    wheres: [
      where('product_subscription_id', '==', id),
      where('product_subscription_date', '==', date),
    ],
  })
}

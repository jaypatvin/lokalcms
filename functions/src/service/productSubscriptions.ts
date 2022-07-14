import { where } from 'firebase/firestore'
import { ProductSubscriptionCreateData } from '../models/ProductSubscription'
import db from '../utils/db'
import { createBaseMethods } from './base'

const {
  findAll,
  findById,
  findByCommunityId,
  create: baseCreate,
  update: baseUpdate,
} = createBaseMethods(db.productSubscriptions)

export { findAll, findByCommunityId, findById }

export const create = (data: ProductSubscriptionCreateData) => baseCreate(data)
export const update = (id: string, data) => baseUpdate(id, data)

export const findProductSubscriptionsByDate = async (dateString: string) => {
  return await findAll({
    wheres: [where('date_string', '==', dateString), where('skip', '==', false)],
  })
}

export const findProductSubscriptionByDateAndPlanId = async (planId: string, dateString: string) => {
  return await findAll({
    wheres: [
      where('product_subscription_plan_id', '==', planId),
      where('date_string', '==', dateString),
    ],
  })
}

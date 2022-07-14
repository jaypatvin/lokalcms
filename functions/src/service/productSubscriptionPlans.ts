import { where } from 'firebase/firestore'
import {
  ProductSubscriptionPlanCreateData,
  ProductSubscriptionPlanUpdateData,
} from '../models/ProductSubscriptionPlan'
import db from '../utils/db'
import { createBaseMethods } from './base'

const {
  findAll,
  findById,
  findByCommunityId,
  create: baseCreate,
  update: baseUpdate,
} = createBaseMethods(db.productSubscriptionPlans)

export { findAll, findByCommunityId, findById }

export const create = (data: ProductSubscriptionPlanCreateData) => baseCreate(data)
export const update = (id: string, data: ProductSubscriptionPlanUpdateData) => baseUpdate(id, data)

export const findAllEnabledSubscriptionPlans = async () => {
  return await findAll({
    wheres: [where('status', '==', 'enabled')],
  })
}

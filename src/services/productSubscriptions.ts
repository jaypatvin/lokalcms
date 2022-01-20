import { SortOrderType } from '../utils/types'
import { db } from '../utils'

type GetProductSubscriptionsParamTypes = {
  product_subscription_plan_id: string
  limit?: number
  sortOrder?: SortOrderType
}

export const getProductSubscriptions = ({
  product_subscription_plan_id,
  limit = 10,
  sortOrder = 'desc',
}: GetProductSubscriptionsParamTypes) => {
  return db.productSubscriptions
    .where('product_subscription_plan_id', '==', product_subscription_plan_id)
    .orderBy('created_at', sortOrder)
    .limit(limit)
}

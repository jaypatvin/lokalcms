import Activity from './Activity'
import ApplicationLog from './ApplicationLog'
import Category from './Category'
import Chat from './Chat'
import Community from './Community'
import Invite from './Invite'
import Order from './Order'
import Product from './Product'
import ProductSubscription from './ProductSubscription'
import ProductSubscriptionPlan from './ProductSubscriptionPlan'
import Shop from './Shop'
import { HistoryLog } from './types'
import User from './User'
export * from './types'

export type DocumentType = (
  | Activity
  | ApplicationLog
  | Category
  | Chat
  | Community
  | HistoryLog
  | Invite
  | Order
  | Product
  | ProductSubscription
  | ProductSubscriptionPlan
  | Shop
  | User
) & { id?: string; archived?: boolean }

import { Timestamp } from 'firebase/firestore'

type HistoryLog = {
  actor_id: string
  source?: 'cms' | 'api' | ''
  community_id: string
  collection_name:
    | 'action_types'
    | 'activities'
    | 'application_logs'
    | 'bank_codes'
    | 'categories'
    | 'chats'
    | 'community'
    | 'invites'
    | 'notification_types'
    | 'orders'
    | 'order_status'
    | 'products'
    | 'product_subscriptions'
    | 'product_subscription_plan'
    | 'shops'
    | 'users'
  document_id: string
  created_at: Timestamp
  keywords: string[]
  method?: 'create' | 'update' | 'archive' | 'delete'
  before?: Record<string, unknown>
  after?: Record<string, unknown>
}

export default HistoryLog

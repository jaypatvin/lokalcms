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
  created_at: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue
  keywords: string[]
  method?: 'create' | 'update' | 'archive' | 'delete'
  before?: any
  after?: any
}

export default HistoryLog

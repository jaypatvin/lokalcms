import { Activity, Shop, Product } from '../index'

type Report = {
  user_id: string
  reported_user_id: string
  description: string
  community_id: string
  activity_id?: string
  shop_id?: string
  product_id?: string
  report_type: 'activity' | 'shop' | 'product'
  created_at: FirebaseFirestore.Timestamp
  updated_at?: FirebaseFirestore.Timestamp
  document_snapshot: Activity | Shop | Product
}

export type ReportCreateData = Pick<
  Report,
  | 'user_id'
  | 'reported_user_id'
  | 'description'
  | 'activity_id'
  | 'product_id'
  | 'shop_id'
  | 'community_id'
  | 'report_type'
  | 'document_snapshot'
>

export default Report

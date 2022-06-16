type Report = {
  user_id: string
  reported_user_id: string
  description: string
  community_id: string
  activity_id?: string
  shop_id?: string
  product_id?: string
  created_at: FirebaseFirestore.Timestamp
  updated_at?: FirebaseFirestore.Timestamp
}

export type ReportCreateData = Pick<
  Report,
  'user_id' | 'reported_user_id' | 'description' | 'activity_id' | 'product_id' | 'shop_id' | 'community_id'
>

export default Report

type Report = {
  user_id: string
  reported_user_id: string
  description: string
  activity_id?: string
  shop_id?: string
  product_id?: string
  created_at: firebase.default.firestore.Timestamp
  updated_at?: firebase.default.firestore.Timestamp
}

export type ReportCreateData = Pick<
  Report,
  'user_id' | 'reported_user_id' | 'description' | 'activity_id' | 'product_id' | 'shop_id'
>

export default Report

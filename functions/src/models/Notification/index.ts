type Notification = {
  type: string
  title: string
  subtitle?: string
  message: string
  associated_collection: string
  associated_document?: string
  associated_documents?: string[]
  config?: {
    [x: string]: unknown
  }
  image?: string
  viewed: boolean
  date_viewed?: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue
  opened: boolean
  date_opened?: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue
  unread: boolean
  archived: boolean
  created_at: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue
  updated_at?: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue
}

export type NotificationCreateData = Pick<
  Notification,
  | 'type'
  | 'title'
  | 'subtitle'
  | 'message'
  | 'associated_collection'
  | 'associated_document'
  | 'associated_documents'
>

export default Notification

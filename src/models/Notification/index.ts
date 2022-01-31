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
  date_viewed?: firebase.default.firestore.Timestamp
  opened: boolean
  date_opened?: firebase.default.firestore.Timestamp
  unread: boolean
  archived: boolean
  created_at: firebase.default.firestore.Timestamp
  updated_at?: firebase.default.firestore.Timestamp
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

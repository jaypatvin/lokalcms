type Notification = {
  type: string
  title: string
  subtitle: string
  message: string
  associated_collection: string
  associated_document: string
  associated_documents: string[]
  config: {
    [x: string]: unknown
  }
  image: string
  viewed: boolean
  date_viewed: FirebaseFirestore.Timestamp
  opened: boolean
  date_opened: FirebaseFirestore.Timestamp
  unread: boolean
  archived: boolean
  created_at: FirebaseFirestore.Timestamp
  updated_at?: FirebaseFirestore.Timestamp
}

export default Notification

type ApplicationLog = {
  action_type: string
  archived: boolean
  associated_document: string
  community_id: string
  created_at: FirebaseFirestore.Timestamp
  device_id: string
  is_authenticated: boolean
  metadata: {
    [x: string]: unknown
  }
  user_id: string
}

export default ApplicationLog

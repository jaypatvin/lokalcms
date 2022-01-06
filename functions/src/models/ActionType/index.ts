type ActionType = {
  associated_collection: string
  can_archive: boolean
  community_admin_visible: boolean
  description: string
  name: string
  user_visible: boolean
  created_at?: FirebaseFirestore.Timestamp
}

export default ActionType

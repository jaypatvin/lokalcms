type Invite = {
  archived: boolean
  claimed: boolean
  code: string
  community_id: string
  created_at: FirebaseFirestore.Timestamp
  expire_by: number
  invitee_email: string
  inviter: string
  keywords: string[]
  status: 'enabled' | 'disabled'
  updated_at?: FirebaseFirestore.Timestamp
  updated_by?: string
  updated_from?: '' | 'cms' | 'app'
}

export default Invite

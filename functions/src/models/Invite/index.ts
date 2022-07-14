import { Timestamp } from 'firebase/firestore'

type Invite = {
  archived: boolean
  claimed: boolean
  code: string
  community_id: string
  created_at: Timestamp
  expire_by: number
  invitee_email: string
  invitee?: string
  inviter: string
  keywords: string[]
  status: 'enabled' | 'disabled'
  updated_at?: Timestamp
  updated_by?: string
  updated_from?: '' | 'cms' | 'app'
}

export type InviteCreateData = Pick<
  Invite,
  | 'claimed'
  | 'code'
  | 'community_id'
  | 'expire_by'
  | 'invitee_email'
  | 'inviter'
  | 'status'
  | 'keywords'
  | 'archived'
  | 'updated_by'
  | 'updated_from'
>

export type InviteUpdateData = Partial<
  Pick<
    Invite,
    'updated_by' | 'updated_from' | 'keywords' | 'invitee_email' | 'status' | 'claimed' | 'invitee'
  >
>

export default Invite

import { Timestamp } from 'firebase/firestore'

type ApplicationLog = {
  action_type: string
  archived: boolean
  associated_document: string
  community_id: string
  created_at: Timestamp
  device_id: string
  is_authenticated: boolean
  metadata: {
    [x: string]: unknown
  }
  user_id: string
}

export type ApplicationLogCreateData = Pick<
  ApplicationLog,
  | 'is_authenticated'
  | 'user_id'
  | 'community_id'
  | 'action_type'
  | 'device_id'
  | 'associated_document'
  | 'metadata'
>

export default ApplicationLog

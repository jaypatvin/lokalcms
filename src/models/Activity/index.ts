import { Like, Comment, Report } from '../'

type Activity = {
  _meta?: {
    comments_count?: number
    likes_count?: number
    reports_count?: number
  }
  archived: boolean
  comments?: firebase.default.firestore.CollectionReference<Comment>
  community_id: string
  created_at: firebase.default.firestore.Timestamp
  images?: {
    url: string
    order: number
  }[]
  likes?: firebase.default.firestore.CollectionReference<Like>
  reports?: firebase.default.firestore.CollectionReference<Report>
  message: string
  status: 'enabled' | 'disabled'
  updated_at?: firebase.default.firestore.Timestamp
  updated_by?: string
  updated_from?: '' | 'cms' | 'app'
  user_id: string
}

export type ActivityCreateData = Pick<
  Activity,
  | 'message'
  | 'user_id'
  | 'community_id'
  | 'status'
  | 'archived'
  | 'updated_by'
  | 'updated_from'
  | 'images'
>

export type ActivityUpdateData = Partial<
  Pick<Activity, 'status' | 'message' | 'updated_by' | 'updated_from'>
>

export default Activity

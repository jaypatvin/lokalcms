import * as admin from 'firebase-admin'
import { Change } from 'firebase-functions'
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore'
import { generateHistoryKeywords } from './generateKeywords'

const db = admin.firestore()

const logActivity = async (change: Change<DocumentSnapshot>) => {
  const isCreate = !change.before.exists && change.after.exists
  const isUpdate = change.before.exists && change.after.exists
  const isDelete = change.before.exists && !change.after.exists

  const collection_name = change.after.exists ? change.after.ref.parent.path : change.before.ref.parent.path
  const document_id = change.after.exists ? change.after.id : change.before.id
  const beforeData: any = change.before.data()
  const afterData: any = change.after.data()
  const data = afterData || beforeData

  const isArchive = beforeData && afterData && !beforeData.isArchived && afterData.isArchived
  const actor_id = afterData && afterData.updated_by ? afterData.updated_by : ''
  const source = afterData && afterData.updated_from ? afterData.updated_from : 'api'
  const community_id = collection_name === 'community' ? document_id : data.community_id

  const keywords = generateHistoryKeywords({
    collection_name,
    actor_id,
    document_id,
    community_id
  })
  const history: any = {
    actor_id,
    source,
    community_id,
    collection_name,
    document_id,
    created_at: new Date(),
    keywords
  }
  if (beforeData) {
    delete beforeData.updated_from
    delete beforeData.updated_by
  }
  if (afterData) {
    delete afterData.updated_from
    delete afterData.updated_by
  }

  if (isCreate) {
    history.method = 'create'
    history.after = data
  } else if (isUpdate) {
    history.method = isArchive ? 'archive' : 'update'
    history.before = beforeData
    history.after = afterData
  } else if (isDelete) {
    history.method = 'delete'
    history.before = data
  }

  return db.collection('history_logs').add(history)
}

export default logActivity

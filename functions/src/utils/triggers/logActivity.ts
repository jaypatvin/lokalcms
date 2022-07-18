import { addDoc, getDoc, Timestamp, getFirestore, doc } from 'firebase/firestore'
import { Change, firestore } from 'firebase-functions'
import { HistoryLog } from '../../models'
import { db } from '../db'
import { generateHistoryKeywords } from '../generators'

const logActivity = async (change: Change<firestore.DocumentSnapshot>) => {
  const isCreate = !change.before.exists && change.after.exists
  const isUpdate = change.before.exists && change.after.exists
  const isDelete = change.before.exists && !change.after.exists

  const collection_name = (
    change.after.exists ? change.after.ref.parent.path : change.before.ref.parent.path
  ) as HistoryLog['collection_name']
  const document_id = change.after.exists ? change.after.id : change.before.id
  const beforeData = (await getDoc(doc(getFirestore(), collection_name, change.before.id))).data()
  const afterData = (await getDoc(doc(getFirestore(), collection_name, change.after.id))).data()
  const data = afterData || beforeData

  const isArchive = beforeData && afterData && !beforeData.archived && afterData.archived
  const actor_id = afterData && afterData.updated_by ? afterData.updated_by : ''
  const source = afterData && afterData.updated_from ? afterData.updated_from : 'api'
  const community_id = collection_name === 'community' ? document_id : data.community_id || ''

  const keywords = generateHistoryKeywords({
    collection_name,
    actor_id,
    document_id,
    community_id,
  })
  const history: HistoryLog = {
    actor_id,
    source,
    community_id,
    collection_name,
    document_id,
    created_at: Timestamp.now(),
    keywords,
  }
  if (beforeData) {
    delete beforeData.updated_from
    delete beforeData.updated_by
    delete beforeData.keywords
  }
  if (afterData) {
    delete afterData.updated_from
    delete afterData.updated_by
    delete afterData.keywords
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

  return addDoc(db.historyLogs, history)
}

export default logActivity

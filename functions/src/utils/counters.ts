import * as admin from 'firebase-admin'
import { Change, EventContext } from 'firebase-functions'
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore'

const db = admin.firestore()

type collections = 'users' | 'community' | 'shops' | 'products' | 'invites'
const eventsCol = '_events'
const metaCol = '_meta'

const getCountRef = (params: any) => {
  const isSubCol = params.subDocId

  const parentDoc = `${metaCol}/${params.colId}`
  const countDoc = isSubCol ? `${parentDoc}/${params.docId}/${params.subColId}` : parentDoc

  return db.doc(countDoc)
}

const updateCountsInDoc = async (
  doc_id: string,
  collection_name: string,
  has_collection_name: string,
  foreign_key: string,
  count: FirebaseFirestore.FieldValue,
  transaction: FirebaseFirestore.Transaction
) => {
  const countRef = db.doc(`${metaCol}/${collection_name}/${metaCol}/${doc_id}`)
  const countSnap = await countRef.get()
  const countData = countSnap.data()
  if (countSnap.exists && countData && countData[`${has_collection_name}_count`]) {
    await transaction.update(countRef, { [`${has_collection_name}_count`]: count })
  } else {
    db.runTransaction(async (tr: FirebaseFirestore.Transaction) => {
      const subCollectionsRef = db.collection(has_collection_name).where(foreign_key, '==', doc_id)
      const colSnap = await tr.get(subCollectionsRef)
      if (countSnap.exists) {
        tr.update(countRef, { [`${has_collection_name}_count`]: colSnap.size })
      } else {
        tr.set(countRef, { [`${has_collection_name}_count`]: colSnap.size })
      }
    })
  }
  return null
}

export const runCounter = async (
  collection_name: collections,
  change: Change<DocumentSnapshot>,
  context: EventContext
) => {
  const createDoc = change.after.exists && !change.before.exists
  const updateDoc = change.before.exists && change.after.exists

  if (updateDoc) {
    // TODO: if collection is user and community is changed
    return null
  }

  const countRef = getCountRef({ ...context.params, colId: collection_name })
  const countSnap = await countRef.get()

  const n = createDoc ? 1 : -1
  const count = admin.firestore.FieldValue.increment(n)

  const eventRef = db.doc(`${eventsCol}/${context.eventId}`)

  return db
    .runTransaction(async (transaction: FirebaseFirestore.Transaction) => {
      const eventSnap = await transaction.get(eventRef)

      if (eventSnap.exists) {
        return null
      }

      if (countSnap.exists) {
        await transaction.update(countRef, { count: count })
      } else {
        const colRef = db.collection(change.after.ref.parent.path)
        const colSnap = await transaction.get(colRef)
        await transaction.set(countRef, { count: colSnap.size })
      }

      // side effects
      const data = change.before.data() || change.after.data()
      let community_id
      switch (collection_name) {
        case 'users':
          community_id = data.community_id
          await updateCountsInDoc(
            community_id,
            'community',
            'users',
            'community_id',
            count,
            transaction
          )
          break
        case 'community':
          break
        case 'shops':
          // increment community shop count
          community_id = data.community_id
          await updateCountsInDoc(
            community_id,
            'community',
            'shops',
            'community_id',
            count,
            transaction
          )
          // TODO: is it worth it to store shops count for users?
          break
        case 'products':
          const shop_id = data.shop_id
          community_id = data.community_id
          await updateCountsInDoc(shop_id, 'shops', 'products', 'shop_id', count, transaction)
          await updateCountsInDoc(
            community_id,
            'community',
            'products',
            'community_id',
            count,
            transaction
          )
          break
        default:
          break
      }

      return transaction.set(eventRef, {
        completed: admin.firestore.FieldValue.serverTimestamp(),
        collection: collection_name,
        doc_id: change.before.id || change.after.id,
        activity: createDoc ? 'add' : 'delete',
      })
    })
    .catch(console.error)
}

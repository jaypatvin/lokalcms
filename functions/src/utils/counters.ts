import * as admin from 'firebase-admin'
import { Change, EventContext } from 'firebase-functions'
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore'

const db = admin.firestore()

type collections = 'users' | 'community' | 'shops' | 'products'
const eventsCol = '_events'
const metaCol = '_meta'

const getCountRef = (params: any) => {
  const isSubCol = params.subDocId

  const parentDoc = `${metaCol}/${params.colId}`
  const countDoc = isSubCol ? `${parentDoc}/${params.docId}/${params.subColId}` : parentDoc

  return db.doc(countDoc)
}

const updateMemberCountForCommunity = async (
  community_id: string,
  transaction: FirebaseFirestore.Transaction,
  member_count: FirebaseFirestore.FieldValue
) => {
  const communityCountRef = db.doc(`${metaCol}/community/${metaCol}/${community_id}`)
  const communityCountSnap = await communityCountRef.get()
  if (communityCountSnap.exists) {
    await transaction.update(communityCountRef, { member_count })
  } else {
    db.runTransaction(async (tr: FirebaseFirestore.Transaction) => {
      const communityRef = db.collection('users').where('community_id', '==', community_id)
      const colSnap = await tr.get(communityRef)
      tr.set(communityCountRef, { member_count: colSnap.size })
    })
  }
  return null
}

const updateShopCountForCommunity = async (
  community_id: string,
  transaction: FirebaseFirestore.Transaction,
  shops_count: FirebaseFirestore.FieldValue
) => {
  const communityCountRef = db.doc(`${metaCol}/community/${metaCol}/${community_id}`)
  const communityCountSnap = await communityCountRef.get()
  if (communityCountSnap.exists) {
    await transaction.update(communityCountRef, { shops_count })
  } else {
    db.runTransaction(async (tr: FirebaseFirestore.Transaction) => {
      const communityRef = db.collection('shops').where('community_id', '==', community_id)
      const colSnap = await tr.get(communityRef)
      tr.set(communityCountRef, { shops_count: colSnap.size })
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
          await updateMemberCountForCommunity(community_id, transaction, count)
          break
        case 'community':
          break
        case 'shops':
          // increment community shop count
          community_id = data.community_id
          await updateShopCountForCommunity(community_id, transaction, count)
          // TODO: is it worth it to store shops count for users?
          break
        case 'products':
          // increment product count of shop
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

import * as admin from 'firebase-admin'
import { Change, EventContext } from 'firebase-functions'
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore'

const db = admin.firestore()

type UpdateCountsInDocArgType = {
  docId: string
  collection: string
  hasCollection: string
  countName?: string
  isSubcollection?: boolean
  parentCollection?: string
  parentDocId?: string
  foreignKey?: string
  count: FirebaseFirestore.FieldValue
  transaction: FirebaseFirestore.Transaction
}
type Collections =
  | 'users'
  | 'community'
  | 'shops'
  | 'products'
  | 'invites'
  | 'categories'
  | 'activities'
  | 'orders'
  | 'application_logs'
  | 'action_types'
  | 'chats'
  | 'product_subscription_plans'
const eventsCol = '_events'
const metaCol = '_meta'

const getCountRef = (params: any) => {
  const { colId, docId, subColId, subDocId } = params
  const isSubDoc = subColId && subDocId
  return isSubDoc ? db.doc(`${colId}/${docId}`) : db.doc(`${metaCol}/${colId}`)
}

const updateCountsInDoc = async (options: UpdateCountsInDocArgType) => {
  const {
    docId,
    collection,
    hasCollection,
    countName,
    isSubcollection,
    parentCollection,
    parentDocId,
    foreignKey,
    count,
    transaction,
  } = options
  if (!isSubcollection && !foreignKey) {
    console.error('foreignKey is required if not subcollection')
    return null
  }
  const metaCountName = countName || `${hasCollection}_count`
  const countRef = db.doc(`${collection}/${docId}`)
  const countSnap = await countRef.get()
  const countData = countSnap.data()

  if (!countSnap.exists || !countData) return null

  if (countData._meta && countData._meta[metaCountName]) {
    await transaction.update(countRef, { [`_meta.${metaCountName}`]: count })
  } else {
    await db.runTransaction(async (tr: FirebaseFirestore.Transaction) => {
      const subCollectionsRef = isSubcollection
        ? db.collection(`${collection}/${docId}/${hasCollection}`)
        : db
            .collection(
              parentDocId ? `${parentCollection}/${parentDocId}/${hasCollection}` : hasCollection
            )
            .where(foreignKey, '==', docId)
      const colSnap = await tr.get(subCollectionsRef)
      tr.update(countRef, { [`_meta.${metaCountName}`]: colSnap.size })
    })
  }
}

const runCounter = async (
  collection_name: Collections,
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

  const isSubDoc = context.params.subColId && context.params.subDocId

  return db
    .runTransaction(async (transaction: FirebaseFirestore.Transaction) => {
      const eventSnap = await transaction.get(eventRef)

      if (eventSnap.exists) {
        return null
      }

      if (!isSubDoc) {
        if (countSnap.exists) {
          await transaction.update(countRef, { count: count })
        } else {
          const colRef = db.collection(change.after.ref.parent.path)
          const colSnap = await transaction.get(colRef)
          await transaction.set(countRef, { count: colSnap.size })
        }
      } else if (countSnap.exists) {
        await transaction.update(countRef, { [`_meta.${context.params.subColId}_count`]: count })
      }

      // side effects
      const data = change.before.data() || change.after.data()
      const parentDocId = context.params.docId
      let product_id
      let shop_id
      let community_id
      let user_id
      let buyer_id
      let seller_id
      let activity_id
      switch (context.params.subColId || collection_name) {
        case 'users':
          community_id = data.community_id
          await updateCountsInDoc({
            docId: community_id,
            collection: 'community',
            hasCollection: 'users',
            foreignKey: 'community_id',
            count,
            transaction,
          })
          break
        case 'shops':
          user_id = data.user_id
          community_id = data.community_id
          await updateCountsInDoc({
            docId: community_id,
            collection: 'community',
            hasCollection: 'shops',
            foreignKey: 'community_id',
            count,
            transaction,
          })
          await updateCountsInDoc({
            docId: user_id,
            collection: 'users',
            hasCollection: 'shops',
            foreignKey: 'user_id',
            count,
            transaction,
          })
          break
        case 'products':
          user_id = data.user_id
          shop_id = data.shop_id
          community_id = data.community_id
          await updateCountsInDoc({
            docId: user_id,
            collection: 'users',
            hasCollection: 'products',
            foreignKey: 'user_id',
            count,
            transaction,
          })
          await updateCountsInDoc({
            docId: shop_id,
            collection: 'shops',
            hasCollection: 'products',
            foreignKey: 'shop_id',
            count,
            transaction,
          })
          await updateCountsInDoc({
            docId: community_id,
            collection: 'community',
            hasCollection: 'products',
            foreignKey: 'community_id',
            count,
            transaction,
          })
          break
        case 'orders':
          buyer_id = data.buyer_id
          seller_id = data.seller_id
          shop_id = data.shop_id
          community_id = data.community_id
          await updateCountsInDoc({
            docId: buyer_id,
            collection: 'users',
            hasCollection: 'orders',
            foreignKey: 'buyer_id',
            countName: 'orders_as_buyer_count',
            count,
            transaction,
          })
          await updateCountsInDoc({
            docId: seller_id,
            collection: 'users',
            hasCollection: 'orders',
            foreignKey: 'seller_id',
            countName: 'orders_as_seller_count',
            count,
            transaction,
          })
          await updateCountsInDoc({
            docId: shop_id,
            collection: 'shops',
            hasCollection: 'orders',
            foreignKey: 'shop_id',
            count,
            transaction,
          })
          await updateCountsInDoc({
            docId: community_id,
            collection: 'community',
            hasCollection: 'orders',
            foreignKey: 'community_id',
            count,
            transaction,
          })
          break
        case 'product_subscription_plans':
          buyer_id = data.buyer_id
          seller_id = data.seller_id
          product_id = data.product_id
          shop_id = data.shop_id
          community_id = data.community_id
          await updateCountsInDoc({
            docId: buyer_id,
            collection: 'users',
            hasCollection: 'product_subscription_plans',
            foreignKey: 'buyer_id',
            countName: 'product_subscription_plans_as_buyer_count',
            count,
            transaction,
          })
          await updateCountsInDoc({
            docId: seller_id,
            collection: 'users',
            hasCollection: 'product_subscription_plans',
            foreignKey: 'seller_id',
            countName: 'product_subscription_plans_as_seller_count',
            count,
            transaction,
          })
          await updateCountsInDoc({
            docId: product_id,
            collection: 'products',
            hasCollection: 'product_subscription_plans',
            foreignKey: 'product_id',
            count,
            transaction,
          })
          await updateCountsInDoc({
            docId: shop_id,
            collection: 'shops',
            hasCollection: 'product_subscription_plans',
            foreignKey: 'shop_id',
            count,
            transaction,
          })
          await updateCountsInDoc({
            docId: community_id,
            collection: 'community',
            hasCollection: 'product_subscription_plans',
            foreignKey: 'community_id',
            count,
            transaction,
          })
          break
        case 'wishlists':
          user_id = data.user_id
          await updateCountsInDoc({
            docId: user_id,
            collection: 'users',
            hasCollection: 'wishlists',
            parentCollection: 'products',
            parentDocId,
            foreignKey: 'user_id',
            count,
            transaction,
          })
          break
        case 'reviews':
          user_id = data.user_id
          await updateCountsInDoc({
            docId: user_id,
            collection: 'users',
            hasCollection: 'reviews',
            parentCollection: 'products',
            parentDocId,
            foreignKey: 'user_id',
            count,
            transaction,
          })
          break
        case 'likes':
          user_id = data.user_id
          if (['products', 'shops', 'activities'].includes(collection_name)) {
            await updateCountsInDoc({
              docId: user_id,
              collection: 'users',
              hasCollection: 'likes',
              parentCollection: collection_name,
              parentDocId,
              foreignKey: 'user_id',
              countName: `${collection_name}_likes_count`,
              count,
              transaction,
            })
          }
          break
        case 'reports':
          user_id = data.user_id
          if (['products', 'shops', 'activities', 'community'].includes(collection_name)) {
            await updateCountsInDoc({
              docId: user_id,
              collection: 'users',
              hasCollection: 'reports',
              parentCollection: collection_name,
              parentDocId,
              foreignKey: 'user_id',
              countName: 'reports_count',
              count,
              transaction,
            })
            if (collection_name !== 'community') {
              await updateCountsInDoc({
                docId: data.reported_user_id,
                collection: 'users',
                hasCollection: 'reports',
                parentCollection: collection_name,
                parentDocId,
                foreignKey: 'reported_user_id',
                countName: 'reported_count',
                count,
                transaction,
              })
            }
          }
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

export default runCounter

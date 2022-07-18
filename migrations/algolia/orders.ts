import * as admin from 'firebase-admin'
import { SearchClient } from 'algoliasearch'
import { pick } from 'lodash'

const db = admin.firestore()

const orderFields = [
  'buyer_id',
  'community_id',
  'created_at',
  'delivery_address',
  'delivery_date',
  'delivered_date',
  'delivery_option',
  'is_paid',
  'instruction',
  'payment_method',
  'product_ids',
  'products',
  'proof_of_payment',
  'seller_id',
  'shop_id',
  'shop',
  'status_code',
  'updated_at',
  'cancellation_reason',
  'decline_reason',
  'product_subscription_id',
  'product_subscription_date',
]

const importOrders = async (client: SearchClient) => {
  const ordersIndex = client.initIndex('orders')
  const ordersCreatedAtDescIndex = client.initIndex('orders_created_at_desc')

  const ordersRef = await db.collection('orders').get()
  const orderDocs: any = []

  for (const order of ordersRef.docs) {
    const orderData = order.data()

    orderDocs.push({
      objectID: order.id,
      ...pick(orderData, orderFields),
    })
  }

  try {
    await ordersIndex.saveObjects(orderDocs)
    await ordersIndex.setSettings(
      {
        replicas: ['orders_created_at_desc'],
      },
    )
    await ordersIndex.setSettings(
      {
        searchableAttributes: [
          'products.name',
          'shop.name',
        ],
        ranking: [
          'asc(created_at._seconds)',
          'typo',
          'geo',
          'words',
          'filters',
          'proximity',
          'attribute',
          'exact',
          'custom',
        ],
        attributesForFaceting: [
          'filterOnly(buyer_id)',
          'filterOnly(community_id)',
          'filterOnly(delivery_option)',
          'filterOnly(is_paid)',
          'filterOnly(payment_method)',
          'filterOnly(product_ids)',
          'filterOnly(products.category)',
          'filterOnly(seller_id)',
          'filterOnly(shop_id)',
          'filterOnly(status_code)',
        ],
      },
      {
        forwardToReplicas: true,
      }
    )
    await ordersCreatedAtDescIndex.setSettings({
      ranking: [
        'desc(created_at._seconds)',
        'typo',
        'geo',
        'words',
        'filters',
        'proximity',
        'attribute',
        'exact',
        'custom',
      ],
    })
    console.log('orders imported to algolia')
  } catch (error) {
    console.error(error)
  }
  return
}

export default importOrders

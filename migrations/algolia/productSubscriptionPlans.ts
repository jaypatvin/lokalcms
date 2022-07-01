import * as admin from 'firebase-admin'
import { SearchClient } from 'algoliasearch'
import { pick } from 'lodash'

const db = admin.firestore()

const productSubscriptionPlanFields = [
  'archived',
  'buyer_id',
  'community_id',
  'created_at',
  'instruction',
  'payment_method',
  'plan',
  'product',
  'product_id',
  'quantity',
  'seller_id',
  'shop_id',
  'shop',
  'status',
  'updated_at',
]

const importProductSubscriptionPlans = async (client: SearchClient) => {
  const plansIndex = client.initIndex('product_subscription_plans')
  const plansCreatedAtDescIndex = client.initIndex('product_subscription_plans_created_at_desc')

  const subscriptionPlansRef = await db.collection('product_subscription_plans').get()
  const subscriptionPlanDocs = []

  for (const subscriptionPlan of subscriptionPlansRef.docs) {
    const subscriptionPlanData = subscriptionPlan.data()

    subscriptionPlanDocs.push({
      objectID: subscriptionPlan.id,
      ...pick(subscriptionPlanData, productSubscriptionPlanFields),
    })
  }

  try {
    await plansIndex.saveObjects(subscriptionPlanDocs)
    await plansIndex.setSettings({
      replicas: ['product_subscription_plans_created_at_desc'],
    })
    await plansIndex.setSettings(
      {
        searchableAttributes: ['product.name', 'shop.name'],
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
          'filterOnly(payment_method)',
          'filterOnly(product_id)',
          'filterOnly(seller_id)',
          'filterOnly(shop_id)',
          'filterOnly(status)',
        ],
      },
      {
        forwardToReplicas: true,
      }
    )
    await plansCreatedAtDescIndex.setSettings({
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
    console.log('subscriptionPlans imported to algolia')
  } catch (error) {
    console.error(error)
  }
  return
}

export default importProductSubscriptionPlans

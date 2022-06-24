import * as admin from 'firebase-admin'
import { SearchClient } from 'algoliasearch'
import { pick } from 'lodash'

const db = admin.firestore()

const reviewFields = [
  'user_id',
  'user_email',
  'message',
  'rating',
  'order_id',
  'product_id',
  'shop_id',
  'community_id',
  'created_at',
  'updated_at',
]

const importReviews = async (client: SearchClient) => {
  const reviewsIndex = client.initIndex('reviews')
  const reviewsCreatedAtDescIndex = client.initIndex('reviews_created_at_desc')
  const reviewsRatingAscIndex = client.initIndex('reviews_rating_asc')
  const reviewsRatingDescIndex = client.initIndex('reviews_rating_desc')
  const reviewsRef = await db.collectionGroup('reviews').get()
  const reviewDocs = []

  for (const review of reviewsRef.docs) {
    const reviewData = review.data()

    const userRef = await db.collection('users').doc(reviewData.user_id).get()
    const userEmail = userRef.data().email

    const productRef = await db.collection('products').doc(reviewData.product_id).get()
    const product = productRef.data()

    reviewDocs.push({
      objectID: review.id,
      ...pick(reviewData, reviewFields),
      user_email: userEmail,
      shop_id: product.shop_id,
      community_id: product.community_id,
      seller_id: product.user_id,
    })
  }

  try {
    await reviewsIndex.saveObjects(reviewDocs)
    await reviewsIndex.setSettings(
      {
        replicas: ['reviews_created_at_desc', 'reviews_rating_desc', 'reviews_rating_asc'],
      },
    )
    await reviewsIndex.setSettings(
      {
        searchableAttributes: ['message', 'user_email'],
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
          'filterOnly(order_id)',
          'filterOnly(product_id)',
          'filterOnly(shop_id)',
          'filterOnly(user_id)',
          'filterOnly(community_id)',
          'filterOnly(rating)',
          'filterOnly(seller_id)',
        ],
      },
      {
        forwardToReplicas: true,
      }
    )
    await reviewsCreatedAtDescIndex.setSettings({
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
    await reviewsRatingAscIndex.setSettings({
      ranking: [
        'asc(rating)',
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
    await reviewsRatingDescIndex.setSettings({
      ranking: [
        'desc(rating)',
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
    console.log('reviews imported to algolia')
  } catch (error) {
    console.error(error)
  }
  return
}

export default importReviews

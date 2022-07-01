import Chance from 'chance'
import db from '../../utils/db'
import sleep from '../../utils/sleep'
import { AdminType } from '../dbseed'

const chance = new Chance()

export const seedActivityReports = async ({ admin }: { admin: AdminType }) => {
  const users = (await db.users.get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const activities = (await db.activities.get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  for (const activity of activities) {
    const owner = users.find((user) => user.id === activity.user_id)
    for (const reporter of users.filter(
      (user) => user.community_id === activity.community_id && user.id !== activity.user_id
    )) {
      if (chance.bool()) {
        await sleep(100)
        try {
          await db.getActivityReports(`activities/${activity.id}/reports`).add({
            description: chance.sentence(),
            user_id: reporter.id,
            reported_user_id: owner.id,
            activity_id: activity.id,
            community_id: activity.community_id,
            document_snapshot: activity,
            report_type: 'activity',
            created_at: admin.firestore.Timestamp.now(),
          })
        } catch (error) {
          console.error('Error creating activity report:', error)
        }
      }
    }
  }
}

export const seedShopReports = async ({ admin }: { admin: AdminType }) => {
  const users = (await db.users.get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const shops = (await db.shops.get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  for (const shop of shops) {
    const owner = users.find((user) => user.id === shop.user_id)
    for (const reporter of users.filter(
      (user) => user.community_id === shop.community_id && user.id !== shop.user_id
    )) {
      if (chance.bool()) {
        await sleep(100)
        try {
          await db.getActivityReports(`shops/${shop.id}/reports`).add({
            description: chance.sentence(),
            user_id: reporter.id,
            reported_user_id: owner.id,
            shop_id: shop.id,
            community_id: shop.community_id,
            document_snapshot: shop,
            report_type: 'shop',
            created_at: admin.firestore.Timestamp.now(),
          })
        } catch (error) {
          console.error('Error creating shop report:', error)
        }
      }
    }
  }
}

export const seedProductReports = async ({ admin }: { admin: AdminType }) => {
  const users = (await db.users.get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const products = (await db.products.get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  for (const product of products) {
    const owner = users.find((user) => user.id === product.user_id)
    for (const reporter of users.filter(
      (user) => user.community_id === product.community_id && user.id !== product.user_id
    )) {
      if (chance.bool()) {
        await sleep(100)
        try {
          await db.getActivityReports(`products/${product.id}/reports`).add({
            description: chance.sentence(),
            user_id: reporter.id,
            reported_user_id: owner.id,
            shop_id: product.shop_id,
            product_id: product.id,
            community_id: product.community_id,
            document_snapshot: product,
            report_type: 'product',
            created_at: admin.firestore.Timestamp.now(),
          })
        } catch (error) {
          console.error('Error creating product report:', error)
        }
      }
    }
  }
}

export const seedReports = async ({ admin }: { admin: AdminType }) => {
  await seedActivityReports({ admin })
  await seedShopReports({ admin })
  await seedProductReports({ admin })
}

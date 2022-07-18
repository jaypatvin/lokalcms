import Chance from 'chance'
import { addDoc, getDocs, Timestamp } from 'firebase/firestore'
import db from '../../utils/db'
import sleep from '../../utils/sleep'

const chance = new Chance()

export const seedActivityReports = async () => {
  const users = (await getDocs(db.users)).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const activities = (await getDocs(db.activities)).docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))

  for (const activity of activities) {
    const owner = users.find((user) => user.id === activity.user_id)
    for (const reporter of users.filter(
      (user) => user.community_id === activity.community_id && user.id !== activity.user_id
    )) {
      if (chance.bool()) {
        await sleep(100)
        try {
          await addDoc(db.getActivityReports(`activities/${activity.id}/reports`), {
            description: chance.sentence(),
            user_id: reporter.id,
            reported_user_id: owner!.id,
            activity_id: activity.id,
            community_id: activity.community_id,
            document_snapshot: activity,
            report_type: 'activity',
            created_at: Timestamp.now(),
          })
        } catch (error) {
          console.error('Error creating activity report:', error)
        }
      }
    }
  }
}

export const seedShopReports = async () => {
  const users = (await getDocs(db.users)).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const shops = (await getDocs(db.shops)).docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  for (const shop of shops) {
    const owner = users.find((user) => user.id === shop.user_id)
    for (const reporter of users.filter(
      (user) => user.community_id === shop.community_id && user.id !== shop.user_id
    )) {
      if (chance.bool()) {
        await sleep(100)
        try {
          await addDoc(db.getActivityReports(`shops/${shop.id}/reports`), {
            description: chance.sentence(),
            user_id: reporter.id,
            reported_user_id: owner!.id,
            shop_id: shop.id,
            community_id: shop.community_id,
            document_snapshot: shop,
            report_type: 'shop',
            created_at: Timestamp.now(),
          })
        } catch (error) {
          console.error('Error creating shop report:', error)
        }
      }
    }
  }
}

export const seedProductReports = async () => {
  const users = (await getDocs(db.users)).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const products = (await getDocs(db.products)).docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  for (const product of products) {
    const owner = users.find((user) => user.id === product.user_id)
    for (const reporter of users.filter(
      (user) => user.community_id === product.community_id && user.id !== product.user_id
    )) {
      if (chance.bool()) {
        await sleep(100)
        try {
          await addDoc(db.getActivityReports(`products/${product.id}/reports`), {
            description: chance.sentence(),
            user_id: reporter.id,
            reported_user_id: owner!.id,
            shop_id: product.shop_id,
            product_id: product.id,
            community_id: product.community_id,
            document_snapshot: product,
            report_type: 'product',
            created_at: Timestamp.now(),
          })
        } catch (error) {
          console.error('Error creating product report:', error)
        }
      }
    }
  }
}

export const seedReports = async () => {
  await seedActivityReports()
  await seedShopReports()
  await seedProductReports()
}

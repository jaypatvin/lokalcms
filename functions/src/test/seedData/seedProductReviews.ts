import Chance from 'chance'
import db from '../../utils/db'
import sleep from '../../utils/sleep'
import { AdminType } from '../dbseed'

const chance = new Chance()

export const seedProductReviews = async ({ admin }: { admin: AdminType }) => {
  const users = (await db.users.get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const products = (await db.products.get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const completedOrders = (await db.orders.where('status_code', '==', 600).get()).docs.map(
    (doc) => ({ id: doc.id, ...doc.data() })
  )
  for (const order of completedOrders) {
    const buyer = users.find((user) => user.id === order.buyer_id)
    const orderProducts = products.filter((product) => order.product_ids.includes(product.id))
    for (const product of orderProducts) {
      if (chance.bool()) {
        await sleep(100)
        try {
          await db.getProductReviews(`products/${product.id}/reviews`).add({
            user_id: buyer.id,
            message: chance.sentence(),
            order_id: order.id,
            product_id: product.id,
            // @ts-ignore
            rating: chance.integer({ min: 1, max: 5 }),
            created_at: admin.firestore.Timestamp.now(),
          })
        } catch (error) {
          console.error('Error creating product review:', error)
        }
      }
    }
  }
}

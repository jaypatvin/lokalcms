import Chance from 'chance'
import { getDocs, Timestamp, where, query, addDoc } from 'firebase/firestore'
import db from '../../utils/db'
import sleep from '../../utils/sleep'

const chance = new Chance()

export const seedProductReviews = async () => {
  const users = (await getDocs(db.users)).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const products = (await getDocs(db.products)).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const completedOrders = (
    await getDocs(query(db.orders, where('status_code', '==', 600)))
  ).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  for (const order of completedOrders) {
    const buyer = users.find((user) => user.id === order.buyer_id)
    const orderProducts = products.filter((product) => order.product_ids.includes(product.id))
    for (const product of orderProducts) {
      if (chance.bool()) {
        await sleep(100)
        try {
          await addDoc(db.getProductReviews(`products/${product.id}/reviews`), {
            user_id: buyer!.id,
            message: chance.sentence(),
            order_id: order.id,
            product_id: product.id,
            shop_id: product.shop_id,
            community_id: product.community_id,
            // @ts-ignore
            rating: chance.integer({ min: 1, max: 5 }),
            created_at: Timestamp.now(),
          })
        } catch (error) {
          console.error('Error creating product review:', error)
        }
      }
    }
  }
}

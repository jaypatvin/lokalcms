/* eslint-disable import/first */
import * as admin from 'firebase-admin'
// process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
// process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'

admin.initializeApp({ projectId: 'lokal-1baac' })

const db = admin.firestore()

const migrate = async () => {
  const ordersRef = await db.collection('orders').get()
  const orderDocs = ordersRef.docs.map((doc): any => {
    return {
      ...doc.data(),
      id: doc.id,
    }
  })
  try {
    for (const order of orderDocs) {
      const totalPrice = order.products.reduce((acc, product) => {
        acc += (product.price * product.quantity);
        return acc;
      }, 0)

      await db.collection('orders').doc(order.id).update({
        total_price: totalPrice
      })

      if (order.status_code === 600) {
        for (const orderProduct of order.products) {
          await db.collection('products').doc(orderProduct.id).update({
            '_meta.sold_count': admin.firestore.FieldValue.increment(orderProduct.quantity)
          })
        }
      }
    }
  } catch (error) {
    console.error(error)
  }
}

migrate().finally(() => {
  process.exit()
})

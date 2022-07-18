import { setDoc, doc } from 'firebase/firestore'
import db from '../../utils/db'
import sleep from '../../utils/sleep'
import { orderStatusCodes } from './mockData/orderStatusCodes'

export const seedOrderStatusCodes = async () => {
  for (const orderStatus of orderStatusCodes) {
    try {
      await sleep(100)
      const { id, buyer_status, seller_status } = orderStatus
      await setDoc(doc(db.orderStatus, id), {
        buyer_status,
        seller_status,
      })
    } catch (error) {
      console.error('Error creating order status:', error)
    }
  }
}

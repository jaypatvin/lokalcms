import Chance from 'chance'
import dayjs from 'dayjs'
import { addDoc, getDocs, Timestamp } from 'firebase/firestore'
import db from '../../utils/db'
import sleep from '../../utils/sleep'
import { proofOfPayments } from '../sampleImages'

const chance = new Chance()

export const seedOrders = async () => {
  const users = (await getDocs(db.users)).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const randomUsers = chance.pickset(users, 15)
  const products = (await getDocs(db.products)).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const shops = (await getDocs(db.shops)).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  for (const buyer of randomUsers) {
    const communityShops = shops.filter(
      (shop) => shop.community_id === buyer.community_id && shop.user_id !== buyer.id
    )
    const randomShops = chance.pickset(
      communityShops,
      Math.min(communityShops.length, chance.integer({ min: 1, max: 5 }))
    )
    try {
      for (const shop of randomShops) {
        await sleep(100)
        const shopProducts = products.filter((product) => product.shop_id === shop.id)
        const randomProducts = chance.pickset(
          shopProducts,
          Math.min(shopProducts.length, chance.integer({ min: 1, max: 5 }))
        )
        if (randomProducts.length) {
          const deliveryDateInDayJs = dayjs(new Date()).add(
            chance.integer({ min: -10, max: 10 }),
            'day'
          )
          const orderProducts = randomProducts.map((product) => ({
            instruction: chance.bool()
              ? chance.sentence({ words: chance.integer({ min: 3, max: 10 }) })
              : '',
            category: product.product_category,
            description: product.description,
            id: product.id,
            image: product.gallery[0].url,
            name: product.name,
            price: product.base_price,
            quantity: chance.integer({ min: 1, max: 5 }),
          }))
          const totalPrice = orderProducts.reduce((acc, product) => {
            acc += product.price * product.quantity
            return acc
          }, 0)
          const deliveryDate = Timestamp.fromDate(deliveryDateInDayJs.toDate())
          const paymentMethod = chance.pickone(['bank', 'cod'])
          const isDeliveryDatePast = deliveryDateInDayJs.isAfter(dayjs(new Date()))
          const statusCode = isDeliveryDatePast ? 600 : chance.pickone([100, 200, 300, 400, 500])
          const isPaid = isDeliveryDatePast || statusCode === 400
          const deliveryOptions: string[] = []
          if (shop.delivery_options.delivery) deliveryOptions.push('delivery')
          if (shop.delivery_options.pickup) deliveryOptions.push('pickup')
          const proofOfPayment = chance.pickone(proofOfPayments)
          const newOrder: any = {
            buyer_id: buyer.id,
            community_id: buyer.community_id,
            delivery_address: buyer.address,
            delivery_date: deliveryDate,
            delivery_option: chance.pickone(deliveryOptions),
            instruction: chance.bool()
              ? chance.sentence({ words: chance.integer({ min: 3, max: 10 }) })
              : '',
            is_paid: isPaid,
            // @ts-ignore
            payment_method: paymentMethod,
            product_ids: randomProducts.map((product) => product.id),
            products: orderProducts,
            seller_id: shop.user_id,
            shop_id: shop.id,
            shop: {
              description: shop.description,
              image: shop.profile_photo,
              name: shop.name,
            },
            status_code: statusCode,
            created_at: Timestamp.now(),
            total_price: totalPrice,
          }
          if (statusCode === 300) {
            newOrder.proof_of_payment = proofOfPayment
          }
          if (isDeliveryDatePast) {
            newOrder.delivered_date = deliveryDate
          }
          await addDoc(db.orders, newOrder)
        }
      }
    } catch (error) {
      console.error('Error creating order:', error)
    }
  }
}

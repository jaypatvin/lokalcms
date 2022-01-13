import Chance from 'chance'
import dayjs from 'dayjs'
import db from '../../utils/db'
import sleep from '../../utils/sleep'
import { AdminType } from '../dbseed'

const chance = new Chance()

export const seedOrders = async ({ admin }: { admin: AdminType }) => {
  const users = (await db.users.get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const products = (await db.products.get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const shops = (await db.shops.get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  for (const buyer of users) {
    if (chance.bool({ likelihood: 70 })) {
      const communityShops = shops.filter((shop) => shop.community_id === buyer.community_id)
      const randomShops = chance.pickset(
        communityShops,
        chance.integer({ min: 0, max: communityShops.length })
      )
      try {
        for (const shop of randomShops) {
          await sleep(100)
          const shopProducts = products.filter((product) => product.shop_id === shop.id)
          const randomProducts = chance.pickset(
            shopProducts,
            chance.integer({ min: 0, max: communityShops.length })
          )
          if (randomProducts.length) {
            const deliveryDateInDayJs = dayjs(new Date()).add(
              chance.integer({ min: -10, max: 10 }),
              'day'
            )
            const deliveryDate = admin.firestore.Timestamp.fromDate(deliveryDateInDayJs.toDate())
            const paymentMethod = chance.pickone(['bank', 'cod'])
            const isDeliveryDatePast = deliveryDateInDayJs.isAfter(dayjs(new Date()))
            const statusCode = isDeliveryDatePast ? 600 : chance.pickone([100, 200, 300, 400, 500])
            const isPaid = isDeliveryDatePast || statusCode === 400
            const proofOfPayment =
              'https://upload.wikimedia.org/wikipedia/commons/3/3f/CTBC_Bank_ATM_receipt_20190506.jpg'
            const newOrder: any = {
              buyer_id: buyer.id,
              community_id: buyer.community_id,
              delivery_address: buyer.address,
              delivery_date: deliveryDate,
              delivery_option: chance.pickone(['delivery', 'pickup']),
              instruction: chance.pickone([chance.sentence({ words: 10 }), '']),
              is_paid: isPaid,
              // @ts-ignore
              payment_method: paymentMethod,
              product_ids: randomProducts.map((product) => product.id),
              products: randomProducts.map((product) => ({
                instruction: chance.pickone([chance.sentence({ words: 5 }), '']),
                product_category: product.product_category,
                product_description: product.description,
                product_id: product.id,
                product_image: product.gallery[0].url,
                product_name: product.name,
                product_price: product.base_price,
                quantity: chance.integer({ min: 1, max: 5 }),
              })),
              seller_id: shop.user_id,
              shop_description: shop.description,
              shop_id: shop.id,
              shop_image: shop.profile_photo,
              shop_name: shop.name,
              status_code: statusCode,
              created_at: admin.firestore.Timestamp.now(),
            }
            if (statusCode === 300) {
              newOrder.proof_of_payment = proofOfPayment
            }
            if (isDeliveryDatePast) {
              newOrder.delivered_date = deliveryDate
            }
            await db.orders.add(newOrder)
          }
        }
      } catch (error) {
        console.error('Error creating order:', error)
      }
    }
  }
}

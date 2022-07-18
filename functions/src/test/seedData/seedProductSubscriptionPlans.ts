import Chance from 'chance'
import dayjs from 'dayjs'
import { addDoc, getDocs, Timestamp } from 'firebase/firestore'
import generateProductSubscriptions from '../../scheduled/generateProductSubscriptions'
import db from '../../utils/db'
import sleep from '../../utils/sleep'
import { generateRandomSubscriptionSchedule } from '../generateRandomSubscriptionSchedule'

const chance = new Chance()

export const seedProductSubscriptionPlans = async () => {
  const users = (await getDocs(db.users)).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const randomUsers = chance.pickset(users, 5)
  const products = (await getDocs(db.products)).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const shops = (await getDocs(db.shops)).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  for (const buyer of randomUsers) {
    const communityProducts = products.filter((product) => {
      return product.community_id === buyer.community_id && product.user_id !== buyer.id
    })
    const randomProducts = chance.pickset(
      communityProducts,
      Math.min(communityProducts.length, chance.integer({ min: 1, max: 5 }))
    )
    try {
      for (const product of randomProducts) {
        await sleep(100)
        const shop = shops.find((shop) => shop.id === product.shop_id)
        const lastDate = dayjs(new Date())
          .add(chance.integer({ min: 1, max: 11 }), chance.pickone(['month', 'year']))
          .format('YYYY-MM-DD')
        const randomSchedule = generateRandomSubscriptionSchedule()
        await addDoc(db.productSubscriptionPlans, {
          archived: false,
          buyer_id: buyer.id,
          community_id: buyer.community_id,
          created_at: Timestamp.now(),
          instruction: chance.bool()
            ? chance.sentence({ words: chance.integer({ min: 3, max: 10 }) })
            : '',
          payment_method: chance.pickone(['bank', 'cod']),
          product: {
            description: product.description,
            image: product.gallery![0].url,
            name: product.name,
            price: product.base_price,
          },
          product_id: product.id,
          quantity: chance.integer({ min: 1, max: 5 }),
          seller_id: product.user_id,
          shop: {
            description: shop!.description,
            // @ts-ignore: ts bug?
            image: shop!.profile_photo,
            name: shop!.name,
          },
          shop_id: shop!.id,
          status: 'enabled',
          plan: {
            auto_reschedule: chance.bool(),
            last_date: lastDate,
            // @ts-ignore
            repeat_type: randomSchedule.repeat_type,
            repeat_unit: randomSchedule.repeat_unit,
            schedule: randomSchedule.schedule,
            start_dates: randomSchedule.start_dates,
          },
        })
      }
    } catch (error) {
      console.error('Error creating product subscription plan:', error)
    }
  }

  await generateProductSubscriptions()
}

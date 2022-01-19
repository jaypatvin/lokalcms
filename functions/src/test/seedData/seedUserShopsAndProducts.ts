import Chance from 'chance'
import db from '../../utils/db'
import {
  generateProductKeywords,
  generateSchedule,
  generateShopKeywords,
} from '../../utils/generators'
import sleep from '../../utils/sleep'
import { AdminType } from '../dbseed'
import { categories } from './mockData/categories'
import * as samples from '../sampleImages'

const chance = new Chance()

const sampleSchedules = [
  {
    start_time: '09:00 am',
    end_time: '06:00 pm',
    start_dates: ['2022-01-03', '2022-01-05', '2022-01-07'],
    repeat_unit: 1,
    repeat_type: 'week',
  },
  {
    start_time: '11:00 am',
    end_time: '10:00 pm',
    start_dates: ['2022-01-08', '2022-01-09'],
    repeat_unit: 1,
    repeat_type: 'week',
  },
  {
    start_time: '08:00 am',
    end_time: '10:00 pm',
    start_dates: ['2022-01-03', '2022-01-04', '2022-01-05', '2022-01-06', '2022-01-07'],
    repeat_unit: 2,
    repeat_type: 'week',
  },
  {
    start_time: '07:00 am',
    end_time: '03:00 pm',
    start_dates: ['2022-01-16'],
    repeat_unit: 0,
    repeat_type: 'day',
  },
  {
    start_time: '07:00 am',
    end_time: '03:00 pm',
    start_dates: ['2022-01-03'],
    repeat_unit: 1,
    repeat_type: 'day',
  },
  {
    start_time: '01:00 pm',
    end_time: '05:00 pm',
    start_dates: ['2022-01-05'],
    repeat_unit: 3,
    repeat_type: 'day',
  },
  {
    start_time: '09:00 am',
    end_time: '06:00 pm',
    start_dates: ['2022-01-05'],
    repeat_unit: 1,
    repeat_type: 'month',
  },
  {
    start_time: '09:00 am',
    end_time: '03:00 pm',
    start_dates: ['2022-01-07'],
    repeat_unit: 2,
    repeat_type: 'month',
  },
  {
    start_time: '06:00 am',
    end_time: '06:00 pm',
    start_dates: ['2022-01-09'],
    repeat_unit: 3,
    repeat_type: 'month',
  },
  {
    start_time: '06:00 am',
    end_time: '06:00 pm',
    start_dates: ['2022-01-01'],
    repeat_unit: 3,
    repeat_type: '1-sat',
  },
  {
    start_time: '06:00 am',
    end_time: '06:00 pm',
    start_dates: ['2022-01-09'],
    repeat_unit: 3,
    repeat_type: '2-sun',
  },
  {
    start_time: '06:00 am',
    end_time: '06:00 pm',
    start_dates: ['2022-01-14'],
    repeat_unit: 3,
    repeat_type: '2-fri',
  },
  {
    start_time: '06:00 am',
    end_time: '06:00 pm',
    start_dates: ['2022-01-17'],
    repeat_unit: 3,
    repeat_type: '3-mon',
  },
  {
    start_time: '06:00 am',
    end_time: '06:00 pm',
    start_dates: ['2022-01-30'],
    repeat_unit: 3,
    repeat_type: '5-sun',
  },
]

export const seedShopsAndProductsOfUser = async ({
  userId,
  communityId,
  displayName,
  admin,
}: {
  userId: string
  communityId: string
  displayName: string
  admin: AdminType
}) => {
  const shopCount = chance.integer({ min: 0, max: 3 })
  for (let i = 1; i <= shopCount; i++) {
    await sleep(100)
    try {
      const name = chance.company()
      const keywords = generateShopKeywords({ name })
      const randomSchedule = chance.pickone(sampleSchedules)
      const { start_time, end_time, start_dates, repeat_unit, repeat_type } = randomSchedule
      const operatingHours = {
        start_time,
        end_time,
        start_dates,
        repeat_unit,
        repeat_type,
        schedule: generateSchedule({
          start_time,
          end_time,
          start_dates,
          repeat_unit,
          repeat_type: repeat_type as any,
        }),
      }
      const { id: shopId } = await db.shops.add({
        name,
        description: chance.sentence(),
        user_id: userId,
        community_id: communityId,
        is_close: false,
        status: 'enabled',
        keywords,
        archived: false,
        profile_photo: chance.pickone(samples.shops),
        cover_photo: chance.pickone(samples.shops),
        payment_options: [
          {
            bank_code: 'bdo',
            type: 'bank',
            account_number: chance.cc(),
            account_name: displayName,
          },
          {
            bank_code: 'gcash',
            type: 'wallet',
            account_number: chance.cc(),
            account_name: displayName,
          },
        ],
        created_at: admin.firestore.Timestamp.now(),
        // @ts-ignore
        operating_hours: operatingHours,
      })

      const productCount = chance.integer({ min: 2, max: 5 })
      for (let i = 1; i <= productCount; i++) {
        await sleep(100)
        try {
          const productName = chance.word({ length: chance.integer({ min: 5, max: 12 }) })
          const productCategory = chance.pickone(categories)
          const productKeywords = generateProductKeywords({
            name: productName,
            product_category: productCategory.id,
          })
          await db.products.add({
            archived: false,
            base_price: chance.integer({ min: 10, max: 1000 }),
            can_subscribe: chance.bool(),
            community_id: communityId,
            created_at: admin.firestore.Timestamp.now(),
            description: chance.sentence(),
            gallery: [
              {
                url: chance.pickone(samples.products),
                order: 0,
              },
            ],
            keywords: productKeywords,
            name: productName,
            product_category: productCategory.id,
            quantity: chance.integer({ min: 5, max: 100 }),
            shop_id: shopId,
            status: 'enabled',
            user_id: userId,
            // @ts-ignore
            availability: operatingHours,
          })
        } catch (error) {
          console.error('Error creating product:', error)
        }
      }
    } catch (error) {
      console.error('Error creating shop:', error)
    }
  }
}

/* eslint-disable import/first */
import * as admin from 'firebase-admin'
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
admin.initializeApp({ projectId: 'lokal-1baac' })

import Chance from 'chance'
import {
  generateCommunityKeywords,
  generateProductKeywords,
  generateSchedule,
  generateShopKeywords,
  generateUserKeywords,
} from '../utils/generators'
import db from '../utils/db'
import dayjs from 'dayjs'
import sleep from '../utils/sleep'
import * as samples from './sampleImages'

const firestoreDb = admin.firestore()
const auth = admin.auth()
const chance = new Chance()

const categorySamples = ['drinks', 'fashion', 'food', 'home_goods']
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
]

const seedShopsAndProductsOfUser = async ({
  userId,
  communityId,
  displayName,
}: {
  userId: string
  communityId: string
  displayName: string
}) => {
  const shopCount = chance.integer({ min: 0, max: 3 })
  for (let i = 1; i <= shopCount; i++) {
    await sleep(100)
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
    const { id: shopId } = await firestoreDb.collection('shops').add({
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
      operating_hours: operatingHours,
    })

    const productCount = chance.integer({ min: 2, max: 5 })
    for (let i = 1; i <= productCount; i++) {
      await sleep(100)
      const productName = chance.word({ length: chance.integer({ min: 5, max: 12 }) })
      const productCategory = chance.pickone(categorySamples)
      const productKeywords = generateProductKeywords({
        name: productName,
        product_category: productCategory,
      })
      await firestoreDb.collection('products').add({
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
        product_category: productCategory,
        quantity: chance.integer({ min: 5, max: 100 }),
        shop_id: shopId,
        status: 'enabled',
        user_id: userId,
        availability: operatingHours,
      })
    }
  }
}

const seedCommunities = async () => {
  try {
    for (let i = 1; i <= 3; i++) {
      await sleep(100)
      const name = chance.last({ nationality: 'it' })
      const subdivision = name
      const city = chance.city()
      const barangay = chance.province({ full: true })
      const state = chance.state()
      const country = chance.country()
      const zipCode = chance.zip()
      const keywords = generateCommunityKeywords({
        name,
        subdivision,
        city,
        barangay,
        state,
        country,
        zip_code: zipCode,
      })
      await firestoreDb.collection('community').add({
        name,
        address: {
          barangay,
          city,
          country,
          state,
          subdivision,
          zip_code: zipCode,
        },
        admin: [],
        keywords,
        archived: false,
        profile_photo: chance.pickone(samples.communities),
        cover_photo: chance.pickone(samples.communities),
        created_at: admin.firestore.Timestamp.now(),
      })
    }
  } catch (error) {
    console.error('Error creating new community:', error)
  }
}

const seedUsers = async () => {
  const communities = (await db.community.get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  for (let i = 1; i <= 20; i++) {
    await sleep(100)
    try {
      const email = chance.email()
      const firstName = chance.first()
      const lastName = chance.last()
      const displayName = `${firstName} ${lastName}`
      const isAdmin = chance.bool()
      const community = chance.pickone(communities)
      const keywords = generateUserKeywords({
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
        email,
      })
      const { uid } = await auth.createUser({
        email,
        emailVerified: true,
        password: 'lokalpassword',
        displayName,
        disabled: false,
      })
      const { id: userId } = await firestoreDb.collection('users').add({
        user_uids: [uid],
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
        email,
        roles: {
          admin: isAdmin,
          editor: isAdmin || chance.bool(),
          member: true,
        },
        status: 'active',
        birthdate: dayjs(chance.birthday()).format('YYYY-MM-DD'),
        registration: {
          id_photo: '',
          id_type: '',
          notes: '',
          step: 0,
          verified: false,
        },
        community_id: community.id,
        community: firestoreDb.collection('community').doc(community.id),
        address: {
          barangay: community.address.barangay,
          street: chance.street(),
          city: community.address.city,
          state: community.address.state,
          subdivision: community.address.subdivision,
          zip_code: community.address.zip_code,
          country: community.address.country,
        },
        profile_photo: chance.pickone(samples.users),
        keywords,
        archived: false,
        created_at: admin.firestore.Timestamp.now(),
      })

      await seedShopsAndProductsOfUser({ userId, communityId: community.id, displayName })
    } catch (error) {
      console.error('Error creating new user:', error)
    }
  }
}

const seedData = async () => {
  await seedCommunities()
  await seedUsers()
}

seedData().finally(() => {
  process.exit()
})

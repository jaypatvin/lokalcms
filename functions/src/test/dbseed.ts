/* eslint-disable import/first */
import * as admin from 'firebase-admin'
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
admin.initializeApp({ projectId: 'lokal-1baac' })

import { seedCommunities } from './seedData/seedCommunities'
import { seedUsers } from './seedData/seedUsers'
import { seedActivities } from './seedData/seedActivities'
import { seedCategories } from './seedData/seedCategories'
import { seedBankCodes } from './seedData/seedBankCodes'
import { seedOrders } from './seedData/seedOrders'
import { seedOrderStatusCodes } from './seedData/seedOrderStatus'
import { seedActionTypes } from './seedData/seedActionTypes'
import { seedNotificationTypes } from './seedData/seedNotificationTypes'
import { seedProductSubscriptionPlans } from './seedData/seedProductSubscriptionPlans'
import { seedProductLikes } from './seedData/seedProductLikes'
import { seedShopLikes } from './seedData/seedShopLikes'
import { seedWishlists } from './seedData/seedWishlists'
import { seedProductReviews } from './seedData/seedProductReviews'
import { seedChats } from './seedData/seedChats'

export type AdminType = typeof admin
export type AuthType = typeof auth

const auth = admin.auth()

const seedData = async () => {
  await seedCategories({ admin })
  await seedBankCodes()
  await seedOrderStatusCodes()
  await seedCommunities({ admin })
  await seedActionTypes()
  await seedNotificationTypes()
  await seedUsers({ admin, auth })
  await seedActivities({ admin })
  await seedOrders({ admin })
  await seedProductSubscriptionPlans({ admin })
  await seedProductLikes({ admin })
  await seedShopLikes({ admin })
  await seedWishlists({ admin })
  await seedProductReviews({ admin })
  await seedChats({ admin })
}

seedData().finally(() => {
  process.exit()
})

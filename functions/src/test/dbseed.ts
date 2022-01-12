/* eslint-disable import/first */
import * as admin from 'firebase-admin'
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
admin.initializeApp({ projectId: 'lokal-1baac' })

import { seedCommunities } from './seedData/seedCommunities'
import { seedUsers } from './seedData/seedUsers'
import { seedActivities } from './seedData/seedActivities'
import { seedCategories } from './seedData/seedCategories'

export type AdminType = typeof admin
export type AuthType = typeof auth

const auth = admin.auth()

const seedData = async () => {
  await seedCommunities({ admin })
  await seedCategories({ admin })
  await seedUsers({ admin, auth })
  await seedActivities({ admin })
}

seedData().finally(() => {
  process.exit()
})

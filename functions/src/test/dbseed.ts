/* eslint-disable import/first */
import * as admin from 'firebase-admin'
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
admin.initializeApp({ projectId: 'lokal-1baac' })

import { seedCommunities } from './seedData/seedCommunities'
import { seedUsers } from './seedData/seedUsers'
import { seedActivities } from './seedData/seedActivities'

export type AdminType = typeof admin
export type AuthType = typeof auth

const firestoreDb = admin.firestore()
const auth = admin.auth()

const seedData = async () => {
  await seedCommunities({ admin, firestoreDb })
  await seedUsers({ admin, auth, firestoreDb })
  await seedActivities({ admin })
}

seedData().finally(() => {
  process.exit()
})

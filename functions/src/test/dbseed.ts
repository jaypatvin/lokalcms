/* eslint-disable import/first */
import * as admin from 'firebase-admin'
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
process.env.GOOGLE_APPLICATION_CREDENTIALS =
  '/home/jet/Development/lokalcms/functions/src/test/firebase-service-key.json'
admin.initializeApp({ projectId: 'lokal-1baac' })

import Chance from 'chance'
import { generateCommunityKeywords, generateUserKeywords } from '../utils/generators'
import db from '../utils/db'
import dayjs from 'dayjs'

const firestoreDb = admin.firestore()
const auth = admin.auth()
const chance = new Chance()

const seedCommunities = async () => {
  try {
    for (let i = 1; i <= 3; i++) {
      const name = chance.company()
      const subdivision = chance.last({ nationality: 'it' })
      const city = chance.city()
      const barangay = chance.province({ full: true })
      const state = chance.state()
      const country = chance.country()
      const zip_code = chance.zip()
      const keywords = generateCommunityKeywords({
        name,
        subdivision,
        city,
        barangay,
        state,
        country,
        zip_code,
      })
      await firestoreDb.collection('community').add({
        name,
        address: {
          barangay,
          city,
          country,
          state,
          subdivision,
          zip_code,
        },
        keywords,
        archived: false,
        profile_photo:
          'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        cover_photo:
          'https://images.unsplash.com/photo-1450609283058-0ec52fa7eac4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      })
    }
  } catch (error) {
    console.error('Error creating new community:', error)
  }
}

const seedUsers = async () => {
  const communities = (await db.community.get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  console.log('communities', communities)
  for (let i = 1; i <= 20; i++) {
    try {
      const email = chance.email()
      const first_name = chance.first()
      const last_name = chance.last()
      const display_name = `${first_name} ${last_name}`
      const admin = chance.bool()
      const community = chance.pickone(communities)
      const keywords = generateUserKeywords({
        first_name,
        last_name,
        display_name,
        email,
      })
      const { uid } = await auth.createUser({
        email,
        emailVerified: true,
        password: 'lokalpassword',
        displayName: display_name,
        disabled: false,
      })
      await firestoreDb.collection('users').add({
        user_uids: [uid],
        first_name,
        last_name,
        display_name,
        email,
        roles: {
          admin,
          editor: admin || chance.bool(),
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
        profile_photo:
          'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
        keywords,
        archived: false,
      })
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

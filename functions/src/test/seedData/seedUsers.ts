import dayjs from 'dayjs'
import Chance from 'chance'
import db from '../../utils/db'
import { generateUserKeywords } from '../../utils/generators'
import sleep from '../../utils/sleep'
import * as samples from '../sampleImages'
import { seedShopsAndProductsOfUser } from './seedUserShopsAndProducts'
import { AdminType, AuthType } from '../dbseed'

const chance = new Chance()

export const seedUsers = async ({
  admin,
  auth,
  firestoreDb,
}: {
  firestoreDb: FirebaseFirestore.Firestore
  admin: AdminType
  auth: AuthType
}) => {
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

      await seedShopsAndProductsOfUser({
        userId,
        communityId: community.id,
        displayName,
        admin,
        firestoreDb,
      })
    } catch (error) {
      console.error('Error creating new user:', error)
    }
  }
}

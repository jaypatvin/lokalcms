import Chance from 'chance'
import db from '../../utils/db'
import { generateCommunityKeywords } from '../../utils/generators'
import sleep from '../../utils/sleep'
import { AdminType } from '../dbseed'
import * as samples from '../sampleImages'

const chance = new Chance()

export const seedCommunities = async ({ admin }: { admin: AdminType }) => {
  for (let i = 1; i <= 3; i++) {
    try {
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
      await db.community.add({
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
    } catch (error) {
      console.error('Error creating community:', error)
    }
  }
}

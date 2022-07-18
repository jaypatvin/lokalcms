import Chance from 'chance'
import { addDoc, Timestamp } from 'firebase/firestore'
import db from '../../utils/db'
import { generateCommunityKeywords } from '../../utils/generators'
import sleep from '../../utils/sleep'
import * as samples from '../sampleImages'

const chance = new Chance()

export const seedCommunities = async () => {
  for (let i = 1; i <= 2; i++) {
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
      await addDoc(db.community, {
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
        created_at: Timestamp.now(),
      })
    } catch (error) {
      console.error('Error creating community:', error)
    }
  }
}

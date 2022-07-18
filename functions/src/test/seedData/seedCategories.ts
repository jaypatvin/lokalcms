import Chance from 'chance'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import db from '../../utils/db'
import { generateCategoryKeywords } from '../../utils/generators'
import sleep from '../../utils/sleep'
import { categories } from './mockData/categories'

const chance = new Chance()

export const seedCategories = async () => {
  for (const category of categories) {
    await sleep(100)
    try {
      const {
        id,
        archived,
        cover_url,
        description = chance.sentence({ words: chance.integer({ min: 3, max: 8 }) }),
        icon_url,
        name,
        status,
      } = category
      const keywords = generateCategoryKeywords({
        name,
      })
      await setDoc(doc(db.categories, id), {
        name,
        archived,
        cover_url,
        description,
        icon_url,
        // @ts-ignore
        status,
        keywords,
        created_at: Timestamp.now(),
      })
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }
}

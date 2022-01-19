import Chance from 'chance'
import db from '../../utils/db'
import { generateCategoryKeywords } from '../../utils/generators'
import sleep from '../../utils/sleep'
import { AdminType } from '../dbseed'
import { categories } from './mockData/categories'

const chance = new Chance()

export const seedCategories = async ({ admin }: { admin: AdminType }) => {
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
      await db.categories.doc(id).set({
        name,
        archived,
        cover_url,
        description,
        icon_url,
        // @ts-ignore
        status,
        keywords,
        created_at: admin.firestore.Timestamp.now(),
      })
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }
}

import Chance from 'chance'
import db from '../../utils/db'
import sleep from '../../utils/sleep'
import { AdminType } from '../dbseed'

const chance = new Chance()

export const seedShopLikes = async ({ admin }: { admin: AdminType }) => {
  const users = (await db.users.get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const shops = (await db.shops.get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  for (const shop of shops) {
    const communityUsers = users.filter((user) => user.community_id === shop.community_id)
    for (const user of communityUsers) {
      if (chance.bool()) {
        await sleep(100)
        try {
          await db.getLikes(`shops/${shop.id}/likes`).doc(`${shop.id}_${user.id}_like`).set({
            parent_collection_path: 'shops',
            parent_collection_name: 'shops',
            user_id: user.id,
            shop_id: shop.id,
            created_at: admin.firestore.Timestamp.now(),
          })
        } catch (error) {
          console.error('Error creating shop like:', error)
        }
      }
    }
  }
}

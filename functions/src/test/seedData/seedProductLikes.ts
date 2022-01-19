import Chance from 'chance'
import db from '../../utils/db'
import sleep from '../../utils/sleep'
import { AdminType } from '../dbseed'

const chance = new Chance()

export const seedProductLikes = async ({ admin }: { admin: AdminType }) => {
  const users = (await db.users.get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const products = (await db.products.get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  for (const product of products) {
    const communityUsers = users.filter((user) => user.community_id === product.community_id)
    for (const user of communityUsers) {
      if (chance.bool()) {
        await sleep(100)
        try {
          await db
            .getLikes(`products/${product.id}/likes`)
            .doc(`${product.id}_${user.id}_like`)
            .set({
              parent_collection_path: 'products',
              parent_collection_name: 'products',
              user_id: user.id,
              product_id: product.id,
              shop_id: product.shop_id,
              created_at: admin.firestore.Timestamp.now(),
            })
        } catch (error) {
          console.error('Error creating product like:', error)
        }
      }
    }
  }
}

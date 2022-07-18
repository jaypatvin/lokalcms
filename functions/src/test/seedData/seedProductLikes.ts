import Chance from 'chance'
import { doc, getDocs, setDoc, Timestamp } from 'firebase/firestore'
import db from '../../utils/db'
import sleep from '../../utils/sleep'

const chance = new Chance()

export const seedProductLikes = async () => {
  const users = (await getDocs(db.users)).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const products = (await getDocs(db.products)).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  for (const product of products) {
    const communityUsers = users.filter((user) => user.community_id === product.community_id)
    for (const user of communityUsers) {
      if (chance.bool()) {
        await sleep(100)
        try {
          await setDoc(
            doc(db.getLikes(`products/${product.id}/likes`), `${product.id}_${user.id}_like`),
            {
              parent_collection_path: 'products',
              parent_collection_name: 'products',
              user_id: user.id,
              product_id: product.id,
              shop_id: product.shop_id,
              created_at: Timestamp.now(),
              community_id: user.community_id,
            }
          )
        } catch (error) {
          console.error('Error creating product like:', error)
        }
      }
    }
  }
}

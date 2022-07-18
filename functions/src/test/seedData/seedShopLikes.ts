import Chance from 'chance'
import { getDocs, setDoc, Timestamp, doc } from 'firebase/firestore'
import db from '../../utils/db'
import sleep from '../../utils/sleep'

const chance = new Chance()

export const seedShopLikes = async () => {
  const users = (await getDocs(db.users)).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const shops = (await getDocs(db.shops)).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  for (const shop of shops) {
    const communityUsers = users.filter((user) => user.community_id === shop.community_id)
    for (const user of communityUsers) {
      if (chance.bool()) {
        await sleep(100)
        try {
          await setDoc(doc(db.getLikes(`shops/${shop.id}/likes`), `${shop.id}_${user.id}_like`), {
            parent_collection_path: 'shops',
            parent_collection_name: 'shops',
            user_id: user.id,
            shop_id: shop.id,
            created_at: Timestamp.now(),
            community_id: user.community_id,
          })
        } catch (error) {
          console.error('Error creating shop like:', error)
        }
      }
    }
  }
}

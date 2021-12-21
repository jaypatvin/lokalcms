import { firestore } from 'firebase-admin'
import { User, Shop, Product, Community } from '../models'

const converter = <T>() => ({
  toFirestore: (data: Partial<T>) => data,
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) => snap.data() as T,
})

const dataPoint = <T>(collectionPath: string) =>
  firestore().collection(collectionPath).withConverter(converter<T>())

const db = {
  users: dataPoint<User>('users'),
  shops: dataPoint<Shop>('shops'),
  products: dataPoint<Product>('products'),
  community: dataPoint<Community>('community'),
}

export { db }
export default db

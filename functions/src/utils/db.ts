import {
  collection,
  collectionGroup,
  FirestoreDataConverter,
  getFirestore,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
  connectFirestoreEmulator,
} from 'firebase/firestore'
import { getApp } from 'firebase/app'
import {
  ActionType,
  Activity,
  ApplicationLog,
  BankCode,
  Category,
  Chat,
  Comment,
  Community,
  Conversation,
  HistoryLog,
  Invite,
  Like,
  Notification,
  NotificationType,
  Order,
  OrderStatus,
  Product,
  ProductSubscription,
  ProductSubscriptionPlan,
  Report,
  Review,
  Shop,
  User,
  Wishlist,
} from '../models'

const firebaseApp = getApp()
const firestore = getFirestore(firebaseApp)
connectFirestoreEmulator(firestore, 'localhost', 8080)

const converter = <T>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: PartialWithFieldValue<T>) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as T,
})

const dataPoint = <T>(collectionPath: string) => {
  return collection(firestore, collectionPath).withConverter(converter<T>())
}

const groupDataPoint = <T>(subCollectionPath: string) => {
  return collectionGroup(firestore, subCollectionPath).withConverter(converter<T>())
}

const db = {
  actionTypes: dataPoint<ActionType>('action_types'),
  activities: dataPoint<Activity>('activities'),
  applicationLogs: dataPoint<ApplicationLog>('application_logs'),
  bankCodes: dataPoint<BankCode>('bank_codes'),
  categories: dataPoint<Category>('categories'),
  chats: dataPoint<Chat>('chats'),
  comments: groupDataPoint<Comment>('comments'),
  community: dataPoint<Community>('community'),
  conversation: groupDataPoint<Conversation>('conversation'),
  getActivityComments: (subCollectionPath) => dataPoint<Comment>(subCollectionPath),
  getActivityReports: (subCollectionPath) => dataPoint<Report>(subCollectionPath),
  getCommunityReports: (subCollectionPath: string) => dataPoint<Report>(subCollectionPath),
  getChatConversations: (subCollectionPath) => dataPoint<Conversation>(subCollectionPath),
  getLikes: (subCollectionPath) => dataPoint<Like>(subCollectionPath),
  getNotifications: (subCollectionPath) => dataPoint<Notification>(subCollectionPath),
  getProductReports: (subCollectionPath) => dataPoint<Report>(subCollectionPath),
  getProductReviews: (subCollectionPath) => dataPoint<Review>(subCollectionPath),
  getProductWishlists: (subCollectionPath) => dataPoint<Wishlist>(subCollectionPath),
  getShopReports: (subCollectionPath) => dataPoint<Report>(subCollectionPath),
  historyLogs: dataPoint<HistoryLog>('history_logs'),
  invites: dataPoint<Invite>('invites'),
  likes: groupDataPoint<Like>('likes'),
  notificationTypes: dataPoint<NotificationType>('notification_types'),
  orders: dataPoint<Order>('orders'),
  orderStatus: dataPoint<OrderStatus>('order_status'),
  products: dataPoint<Product>('products'),
  productSubscriptionPlans: dataPoint<ProductSubscriptionPlan>('product_subscription_plans'),
  productSubscriptions: dataPoint<ProductSubscription>('product_subscriptions'),
  reports: groupDataPoint<Report>('reports'),
  reviews: groupDataPoint<Review>('reviews'),
  shops: dataPoint<Shop>('shops'),
  users: dataPoint<User>('users'),
  wishlists: groupDataPoint<Wishlist>('wishlists'),
}

export { db }
export default db

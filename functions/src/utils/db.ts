import { firestore } from 'firebase-admin'
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

const converter = <T>(): FirebaseFirestore.FirestoreDataConverter<T> => ({
  toFirestore: (data: FirebaseFirestore.PartialWithFieldValue<T>) => data,
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) => snap.data() as T,
})

const dataPoint = <T>(collectionPath: string) => {
  return firestore().collection(collectionPath).withConverter(converter<T>())
}

const groupDataPoint = <T>(subCollectionPath: string) => {
  return firestore().collectionGroup(subCollectionPath).withConverter(converter<T>())
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
  getActivityComments: (subCollectionPath: string) => dataPoint<Comment>(subCollectionPath),
  getActivityReports: (subCollectionPath: string) => dataPoint<Report>(subCollectionPath),
  getChatConversations: (subCollectionPath: string) => dataPoint<Conversation>(subCollectionPath),
  getLikes: (subCollectionPath: string) => dataPoint<Like>(subCollectionPath),
  getNotifications: (subCollectionPath: string) => dataPoint<Notification>(subCollectionPath),
  getProductReports: (subCollectionPath: string) => dataPoint<Report>(subCollectionPath),
  getProductReviews: (subCollectionPath: string) => dataPoint<Review>(subCollectionPath),
  getProductWishlists: (subCollectionPath: string) => dataPoint<Wishlist>(subCollectionPath),
  getShopReports: (subCollectionPath: string) => dataPoint<Report>(subCollectionPath),
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

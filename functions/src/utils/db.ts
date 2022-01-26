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
  Invite,
  Like,
  Notification,
  NotificationType,
  Order,
  OrderStatus,
  Product,
  ProductSubscription,
  ProductSubscriptionPlan,
  Review,
  Shop,
  User,
  Wishlist,
} from '../models'

const converter = <T>() => ({
  toFirestore: (data: Partial<T>) => data,
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
  getActivityComments: (subCollectionPath) => dataPoint<Comment>(subCollectionPath),
  applicationLogs: dataPoint<ApplicationLog>('application_logs'),
  bankCodes: dataPoint<BankCode>('bank_codes'),
  categories: dataPoint<Category>('categories'),
  chats: dataPoint<Chat>('chats'),
  getChatConversations: (subCollectionPath) => dataPoint<Conversation>(subCollectionPath),
  community: dataPoint<Community>('community'),
  invites: dataPoint<Invite>('invites'),
  getLikes: (subCollectionPath) => dataPoint<Like>(subCollectionPath),
  getNotifications: (subCollectionPath) => dataPoint<Notification>(subCollectionPath),
  notificationTypes: dataPoint<NotificationType>('notification_types'),
  orders: dataPoint<Order>('orders'),
  orderStatus: dataPoint<OrderStatus>('order_status'),
  products: dataPoint<Product>('products'),
  getProductReviews: (subCollectionPath) => dataPoint<Review>(subCollectionPath),
  getProductWishlists: (subCollectionPath) => dataPoint<Wishlist>(subCollectionPath),
  productSubscriptions: dataPoint<ProductSubscription>('product_subscriptions'),
  productSubscriptionPlans: dataPoint<ProductSubscriptionPlan>('product_subscription_plans'),
  shops: dataPoint<Shop>('shops'),
  users: dataPoint<User>('users'),
  likes: groupDataPoint<Like>('likes'),
  reviews: groupDataPoint<Review>('reviews'),
  wishlists: groupDataPoint<Wishlist>('wishlists'),
}

export { db }
export default db

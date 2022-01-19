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

const db = {
  actionTypes: dataPoint<ActionType>('action_types'),
  activities: dataPoint<Activity>('activities'),
  getActivityComments: (subCollectionPath: any) => dataPoint<Comment>(subCollectionPath),
  applicationLogs: dataPoint<ApplicationLog>('application_logs'),
  bankCodes: dataPoint<BankCode>('bank_codes'),
  categories: dataPoint<Category>('categories'),
  chats: dataPoint<Chat>('chats'),
  getChatConversations: (subCollectionPath: any) => dataPoint<Conversation>(subCollectionPath),
  community: dataPoint<Community>('community'),
  invites: dataPoint<Invite>('invites'),
  getLikes: (subCollectionPath: any) => dataPoint<Like>(subCollectionPath),
  getNotifications: (subCollectionPath: any) => dataPoint<Notification>(subCollectionPath),
  notificationTypes: dataPoint<NotificationType>('notification_types'),
  orders: dataPoint<Order>('orders'),
  orderStatus: dataPoint<OrderStatus>('order_status'),
  products: dataPoint<Product>('products'),
  getProductReviews: (subCollectionPath: any) => dataPoint<Review>(subCollectionPath),
  getProductWishlists: (subCollectionPath: any) => dataPoint<Wishlist>(subCollectionPath),
  productSubscriptions: dataPoint<ProductSubscription>('product_subscriptions'),
  productSubscriptionPlans: dataPoint<ProductSubscriptionPlan>('product_subscription_plans'),
  shops: dataPoint<Shop>('shops'),
  users: dataPoint<User>('users'),
}

export { db }
export default db

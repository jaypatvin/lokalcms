import { firestore } from 'firebase-admin'
import {
  ActionType,
  Activity,
  ApplicationLog,
  BankCode,
  Category,
  Chat,
  Community,
  Invite,
  NotificationType,
  Order,
  OrderStatus,
  Product,
  ProductSubscription,
  ProductSubscriptionPlan,
  Shop,
  User,
} from '../models'

const converter = <T>() => ({
  toFirestore: (data: Partial<T>) => data,
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) => snap.data() as T,
})

const dataPoint = <T>(collectionPath: string) =>
  firestore().collection(collectionPath).withConverter(converter<T>())

const db = {
  actionTypes: dataPoint<ActionType>('action_types'),
  activities: dataPoint<Activity>('activities'),
  applicationLogs: dataPoint<ApplicationLog>('application_logs'),
  bankCodes: dataPoint<BankCode>('bank_codes'),
  categories: dataPoint<Category>('categories'),
  chats: dataPoint<Chat>('chats'),
  community: dataPoint<Community>('community'),
  invites: dataPoint<Invite>('invites'),
  notificationTypes: dataPoint<NotificationType>('notification_types'),
  orders: dataPoint<Order>('orders'),
  orderStatus: dataPoint<OrderStatus>('order_status'),
  products: dataPoint<Product>('products'),
  productSubscriptions: dataPoint<ProductSubscription>('product_subscriptions'),
  productSubscriptionPlans: dataPoint<ProductSubscriptionPlan>('product_subscription_plans'),
  shops: dataPoint<Shop>('shops'),
  users: dataPoint<User>('users'),
}

export { db }
export default db

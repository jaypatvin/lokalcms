import * as admin from 'firebase-admin'

export const db = admin.firestore()
export const auth = admin.auth()

export * as AuthAPI from './authentication'
export * as UsersAPI from './users'
export * as CommunityAPI from './community'
export * as ShopsAPI from './shops'
export * as ProductsAPI from './products'
export * as InvitesAPI from './invites'
export * as StreamUsersAPI from './streamUsers'
export * as CategoriesAPI from './categories'
export * as ActivitiesAPI from './activities'
export * as CommentsAPI from './comments'
export * as LikesAPI from './likes'
export * as SearchAPI from './search'
export * as ChatsAPI from './chats'
export * as OrdersAPI from './orders'
export * as ProductSubscriptionPlansAPI from './productsSubscriptionPlans'
export * as ProductSubscriptionsAPI from './productSubscriptions'
export * as ApplicationLogsApi from './applicationLogs'
export * as WishlistsApi from './wishlists'
export * as ReviewsApi from './reviews'

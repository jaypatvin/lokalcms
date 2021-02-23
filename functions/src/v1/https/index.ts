import * as admin from 'firebase-admin'

export const db = admin.firestore()
export const auth = admin.auth()

export * as UsersAPI from './users'
export * as CommunityAPI from './community'
export * as ShopsAPI from './shops'
export * as ProductsAPI from './products'
export * as InvitesAPI from './invites'
export * as StreamUsersAPI from './streamUsers'

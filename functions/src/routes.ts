import { Express } from 'express'
import wrapAsync from './utils/wrapAsync'
import { postStreamFeedCredentials } from './v1/https/streamFeedCredentials'

import {
  UsersAPI,
  CommunityAPI,
  ShopsAPI,
  ProductsAPI,
  InvitesAPI,
  StreamUsersAPI,
} from './v1/https'

module.exports = (api: Express) => {
  /**
   * v1 API
   */

  // -- Get Stream Routes
  api.route('/v1/stream/users').post(wrapAsync(StreamUsersAPI.postUsers))
  api.route('/v1/stream/users').get(wrapAsync(StreamUsersAPI.getUsers))
  api
    .route('/v1/stream/stream-feed-credentials')
    .post(StreamUsersAPI.requireAuthHeader, wrapAsync(postStreamFeedCredentials))

  // -- Users routes
  api.route('/v1/users').get(wrapAsync(UsersAPI.getUsers))
  api.route('/v1/users').post(wrapAsync(UsersAPI.createUser))
  api.route('/v1/users/:userId').get(wrapAsync(UsersAPI.getUser))
  api.route('/v1/users/:userId').put(wrapAsync(UsersAPI.updateUser))
  api.route('/v1/users/:userId').delete(wrapAsync(UsersAPI.archiveUser))
  api.route('/v1/users/:userId/shops').get(wrapAsync(ShopsAPI.getUserShops))
  api.route('/v1/users/:userId/products').get(wrapAsync(ProductsAPI.getUserProducts))

  // -- Shops routes
  api.route('/v1/shops').get(wrapAsync(ShopsAPI.getShops))
  api.route('/v1/shops').post(wrapAsync(ShopsAPI.createShop))
  api.route('/v1/shops/:shopId').get(wrapAsync(ShopsAPI.getShopDetails))
  api.route('/v1/shops/:shopId').put(wrapAsync(ShopsAPI.updateShop))
  api.route('/v1/shops/:shopId').delete(wrapAsync(ShopsAPI.deleteShop))

  // -- Invites routes
  api.route('/v1/invite/check/:inviteCode').get(wrapAsync(InvitesAPI.checkInvite))
  api.route('/v1/invite/claim').post(wrapAsync(InvitesAPI.claimInvite))

  // -- Community routes
  api.route('/v1/community').get(wrapAsync(CommunityAPI.getCommunities))
  api.route('/v1/community').post(wrapAsync(CommunityAPI.createCommunity))
  api.route('/v1/community/:communityId').get(wrapAsync(CommunityAPI.getCommunity))
  api.route('/v1/community/:communityId').put(wrapAsync(CommunityAPI.updateCommunity))
  api.route('/v1/community/:communityId').delete(wrapAsync(CommunityAPI.deleteCommunity))
  api.route('/v1/community/:communityId/users').get(wrapAsync(UsersAPI.getUsersByCommunityId))
  api.route('/v1/community/:communityId/shops').get(wrapAsync(ShopsAPI.getCommunityShops))
  api.route('/v1/community/:communityId/products').get(wrapAsync(ProductsAPI.getCommunityProducts))

  // -- Products routes
  api.route('/v1/products').get(wrapAsync(ProductsAPI.getProducts))
  api.route('/v1/products').post(wrapAsync(ProductsAPI.createProduct))
  api.route('/v1/products/:productId').get(wrapAsync(ProductsAPI.getProduct))
  api.route('/v1/products/:productId').put(wrapAsync(ProductsAPI.updateProduct))
  api.route('/v1/products/:productId').delete(wrapAsync(ProductsAPI.deleteProduct))
}

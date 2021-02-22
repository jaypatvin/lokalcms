import wrapAsync from "./utils/wrapAsync"
import { requireAuthHeader } from './v1/https/streamUsers'

import { getUsers, postUsers } from "./v1/https/streamUsers"
import { postStreamFeedCredentials } from "./v1/https/streamFeedCredentials"

import * as UsersAPI from './v1/https/users'
import * as ShopsAPI from './v1/https/shops'

import * as InvitesAPI from './v1/https/invites'
import * as CommunityAPI from "./v1/https/community"
import * as ProductsAPI from "./v1/https/products"
import { Express } from "express"

module.exports = (api: Express) => {

  /**
   * v1 API
   */

  // -- Get Stream Routes 
  api.route("/v1/stream/users").post(wrapAsync(postUsers))
  api.route("/v1/stream/users").get(wrapAsync(getUsers))
  api.route("/v1/stream/stream-feed-credentials").post(requireAuthHeader, wrapAsync(postStreamFeedCredentials))


  // -- Users routes
  api.route("/v1/users").get(wrapAsync(UsersAPI.getUsers))
  api.route("/v1/users").post(wrapAsync(UsersAPI.createUser))
  api.route("/v1/users/:userId").get(wrapAsync(UsersAPI.getUser))
  api.route("/v1/users/:userId").put(wrapAsync(UsersAPI.updateUser))
  api.route("/v1/users/:userId").delete(wrapAsync(UsersAPI.archiveUser))
  
  // -- Shops routes
  api.route("/v1/shops").get(wrapAsync(ShopsAPI.getShops))
  api.route("/v1/shops").post(wrapAsync(ShopsAPI.createShop))
  api.route("/v1/shops/getUserShops").get(wrapAsync(ShopsAPI.getUserShops))
  api.route("/v1/shops/:shopId").get(wrapAsync(ShopsAPI.getShopDetails))
  api.route("/v1/shops/:shopId").put(wrapAsync(ShopsAPI.updateShop))
  api.route("/v1/shops/:shopId").delete(wrapAsync(ShopsAPI.deleteShop))

  // -- Invites routes
  api.route("/v1/invite/check/:inviteCode").get(wrapAsync(InvitesAPI.checkInvite))
  api.route("/v1/invite/claim").post(wrapAsync(InvitesAPI.claimInvite))

  // -- Community routes
  api.route("/v1/community").post(wrapAsync(CommunityAPI.createCommunity))
  api.route("/v1/community/:communityId").put(wrapAsync(CommunityAPI.updateCommunity))
  api.route("/v1/community/:communityId").delete(wrapAsync(CommunityAPI.deleteCommunity))

  // -- Products routes
  api.route('/v1/products').get(wrapAsync(ProductsAPI.getProducts))
  api.route('/v1/products').post(wrapAsync(ProductsAPI.createProduct))
  api.route('/v1/products/:productId').get(wrapAsync(ProductsAPI.getProduct))
  api.route('/v1/products/:productId').put(wrapAsync(ProductsAPI.updateProduct))
  api.route('/v1/products/:productId').delete(wrapAsync(ProductsAPI.deleteProduct))
};

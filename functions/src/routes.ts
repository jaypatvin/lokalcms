import wrapAsync from "./utils/wrapAsync"
import { requireAuthHeader } from './v1/https/streamUsers'

import { getUsers, postUsers } from "./v1/https/streamUsers"
import { postStreamFeedCredentials } from "./v1/https/streamFeedCredentials"

import { getUsers as getUserList, createUser, getUser, updateUser, archiveUser } from './v1/https/users'
import { getShops as getShopList, createShop, getShop, updateShop, deleteShop } from './v1/https/shops'

import { checkInvite, claimInvite } from './v1/https/invites'
import { createCommunity, updateCommunity, deleteCommunity } from "./v1/https/community"
import { getProducts as getProductList, createProduct, deleteProduct, getProduct, updateProduct } from "./v1/https/products"

module.exports = api => {

  /**
   * v1 API
   */

  // -- Get Stream Routes 
  api.route("/v1/stream/users").post(wrapAsync(postUsers))
  api.route("/v1/stream/users").get(wrapAsync(getUsers))
  api.route("/v1/stream/stream-feed-credentials").post(requireAuthHeader, wrapAsync(postStreamFeedCredentials))


  // -- Users routes
  api.route("/v1/users").get(wrapAsync(getUserList))
  api.route("/v1/users").post(wrapAsync(createUser))
  api.route("/v1/users/:userId").get(wrapAsync(getUser))
  api.route("/v1/users/:userId").put(wrapAsync(updateUser))
  api.route("/v1/users/:userId").delete(wrapAsync(archiveUser))
  
  // -- Shops routes
  api.route("/v1/shops").get(wrapAsync(getShopList))
  api.route("/v1/shops").post(wrapAsync(createShop))
  api.route("/v1/shops/:shopId").get(wrapAsync(getShop))
  api.route("/v1/shops/:shopId").put(wrapAsync(updateShop))
  api.route("/v1/shops/:shopId").delete(wrapAsync(deleteShop))

  // -- Invites routes
  api.route("/v1/invite/check/:inviteCode").get(wrapAsync(checkInvite))
  api.route("/v1/invite/claim").post(wrapAsync(claimInvite))

  // -- Community routes
  api.route("/v1/community").post(wrapAsync(createCommunity))
  api.route("/v1/community/:communityId").put(wrapAsync(updateCommunity))
  api.route("/v1/community/:communityId").delete(wrapAsync(deleteCommunity))

  // -- Products routes
  api.route('/v1/products').get(wrapAsync(getProductList))
  api.route('/v1/products').post(wrapAsync(createProduct))
  api.route('/v1/products').put(wrapAsync(updateProduct))
  api.route('/v1/products/:productId').get(wrapAsync(getProduct))
  api.route('/v1/products/:productId').delete(wrapAsync(deleteProduct))
};

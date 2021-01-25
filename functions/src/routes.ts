import wrapAsync from "./utils/wrapAsync"
import { requireAuthHeader } from './v1/https/streamUsers'

import { getUsers, postUsers } from "./v1/https/streamUsers"
import { postStreamFeedCredentials } from "./v1/https/streamFeedCredentials"

import { getUsers as getUserList, createUser, getUser, updateUser, deleteUser } from './v1/https/users'

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
  api.route("/v1/users/:userId").delete(wrapAsync(deleteUser))
  

};

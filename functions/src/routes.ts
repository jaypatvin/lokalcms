import wrapAsync from "./utils/wrapAsync";
import { requireAuthHeader } from './v1/https/streamUsers';

import { getUsers, postUsers } from "./v1/https/streamUsers";
import { postStreamFeedCredentials } from "./v1/https/streamFeedCredentials";

module.exports = api => {

  // v1 API

  api.route("/v1/stream/users").post(wrapAsync(postUsers));
  api.route("/v1/stream/users").get(wrapAsync(getUsers));

  api.route("/v1/stream/stream-feed-credentials").post(requireAuthHeader, wrapAsync(postStreamFeedCredentials));

};

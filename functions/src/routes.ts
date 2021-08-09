import { Express } from 'express'
import swaggerUI from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import wrapAsync from './utils/wrapAsync'
import { postStreamFeedCredentials } from './v1/https/streamFeedCredentials'

import {
  UsersAPI,
  CommunityAPI,
  ShopsAPI,
  ProductsAPI,
  InvitesAPI,
  StreamUsersAPI,
  AuthAPI,
  CategoriesAPI,
  ActivitiesAPI,
  CommentsAPI,
  LikesAPI,
  SearchAPI,
  ChatsAPI,
  OrdersAPI,
  ProductSubscriptionPlansAPI,
  ProductSubscriptionsAPI,
} from './v1/https'

const swaggerOptions: swaggerJsdoc.Options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Lokal App',
      description: 'API documentation for Lokal App',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'https://us-central1-lokal-1baac.cloudfunctions.net/api',
        description: 'production server',
      },
      {
        url: 'http://localhost:5001/lokal-1baac/us-central1/api',
        description: 'development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'authentication',
        description: 'Get your access token here.',
      },
    ],
  },
  apis: ['./src/v1/https/**/*.ts'],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

module.exports = (api: Express) => {
  /**
   * v1 API
   */

  api.use('/v1/api-docs', swaggerUI.serveWithOptions({ redirect: false }))
  api.route('/v1/api-docs').get(swaggerUI.setup(swaggerSpec))

  // -- Authentication
  api.route('/v1/getToken').post(wrapAsync(AuthAPI.getToken))

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
  api.route('/v1/users/:userId/unarchive').put(wrapAsync(UsersAPI.unarchiveUser))
  api.route('/v1/users/:userId/chatSettings').put(wrapAsync(UsersAPI.updateUserChatSettings))
  api.route('/v1/users/:userId/notificationSettings').put(wrapAsync(UsersAPI.updateUserNotificationSettings))
  api.route('/v1/users/:userId/shops').get(wrapAsync(ShopsAPI.getUserShops))
  api.route('/v1/users/:userId/products').get(wrapAsync(ProductsAPI.getUserProducts))
  api.route('/v1/users/:userId/activities').get(wrapAsync(ActivitiesAPI.getUserActivities))
  api.route('/v1/users/:userId/comments').get(wrapAsync(CommentsAPI.getUserComments))

  // -- Shops routes
  api.route('/v1/availableShops').get(wrapAsync(ShopsAPI.getAvailableShops))
  api.route('/v1/shops').get(wrapAsync(ShopsAPI.getShops))
  api.route('/v1/shops').post(wrapAsync(ShopsAPI.createShop))
  api.route('/v1/shops/:shopId').get(wrapAsync(ShopsAPI.getShop))
  api.route('/v1/shops/:shopId').put(wrapAsync(ShopsAPI.updateShop))
  api.route('/v1/shops/:shopId').delete(wrapAsync(ShopsAPI.archiveShop))
  api.route('/v1/shops/:shopId/unarchive').put(wrapAsync(ShopsAPI.unarchiveShop))
  api.route('/v1/shops/:shopId/operatingHours').get(wrapAsync(ShopsAPI.getShopOperatingHours))
  api.route('/v1/shops/:shopId/operatingHours').put(wrapAsync(ShopsAPI.addShopOperatingHours))

  // -- Invites routes
  api.route('/v1/invite/check/:inviteCode').get(wrapAsync(InvitesAPI.checkInvite))
  api.route('/v1/invite').post(wrapAsync(InvitesAPI.createInvite))
  api.route('/v1/invite/:inviteId').put(wrapAsync(InvitesAPI.updateInvite))
  api.route('/v1/invite/:inviteId').delete(wrapAsync(InvitesAPI.archiveInvite))
  api.route('/v1/invite/:inviteId/unarchive').put(wrapAsync(InvitesAPI.unarchiveInvite))
  api.route('/v1/invite/claim').post(wrapAsync(InvitesAPI.claimInvite))

  // -- Community routes
  api.route('/v1/community').get(wrapAsync(CommunityAPI.getCommunities))
  api.route('/v1/community').post(wrapAsync(CommunityAPI.createCommunity))
  api.route('/v1/community/:communityId').get(wrapAsync(CommunityAPI.getCommunity))
  api.route('/v1/community/:communityId').put(wrapAsync(CommunityAPI.updateCommunity))
  api.route('/v1/community/:communityId').delete(wrapAsync(CommunityAPI.deleteCommunity))
  api.route('/v1/community/:communityId/unarchive').put(wrapAsync(CommunityAPI.unarchiveCommunity))
  api.route('/v1/community/:communityId/users').get(wrapAsync(UsersAPI.getUsersByCommunityId))
  api.route('/v1/community/:communityId/shops').get(wrapAsync(ShopsAPI.getCommunityShops))
  api.route('/v1/community/:communityId/products').get(wrapAsync(ProductsAPI.getCommunityProducts))
  api.route('/v1/community/:communityId/activities').get(wrapAsync(ActivitiesAPI.getCommunityActivities))

  // -- Products routes
  api.route('/v1/availableProducts').get(wrapAsync(ProductsAPI.getAvailableProducts))
  api.route('/v1/products').get(wrapAsync(ProductsAPI.getProducts))
  api.route('/v1/products').post(wrapAsync(ProductsAPI.createProduct))
  api.route('/v1/products/:productId').get(wrapAsync(ProductsAPI.getProduct))
  api.route('/v1/products/:productId').put(wrapAsync(ProductsAPI.updateProduct))
  api.route('/v1/products/:productId').delete(wrapAsync(ProductsAPI.archiveProduct))
  api.route('/v1/products/:productId/unarchive').put(wrapAsync(ProductsAPI.unarchiveProduct))
  api.route('/v1/products/:productId/availability').get(wrapAsync(ProductsAPI.getProductAvailability))
  api.route('/v1/products/:productId/availability').put(wrapAsync(ProductsAPI.addProductAvailability))

  // -- Categories routes
  api.route('/v1/categories').get(wrapAsync(CategoriesAPI.getCategories))
  api.route('/v1/categories').post(wrapAsync(CategoriesAPI.createCategory))
  api.route('/v1/categories/:categoryId').get(wrapAsync(CategoriesAPI.getCategory))
  api.route('/v1/categories/:categoryId').put(wrapAsync(CategoriesAPI.updateCategory))
  api.route('/v1/categories/:categoryId/').delete(wrapAsync(CategoriesAPI.archiveCategory))
  api.route('/v1/categories/:categoryId/unarchive').put(wrapAsync(CategoriesAPI.unarchiveCategory))

  // -- Activities routes
  api.route('/v1/activities').get(wrapAsync(ActivitiesAPI.getActivities))
  api.route('/v1/activities').post(wrapAsync(ActivitiesAPI.createActivity))
  api.route('/v1/activities/:activityId').get(wrapAsync(ActivitiesAPI.getActivity))
  api.route('/v1/activities/:activityId').put(wrapAsync(ActivitiesAPI.updateActivity))
  api.route('/v1/activities/:activityId').delete(wrapAsync(ActivitiesAPI.archiveActivity))
  api.route('/v1/activities/:activityId/unarchive').put(wrapAsync(ActivitiesAPI.unarchiveActivity))
  api.route('/v1/activities/:activityId/comments').get(wrapAsync(CommentsAPI.getActivityComments))

  // -- Comments routes
  api.route('/v1/activities/:activityId/comments').post(wrapAsync(CommentsAPI.createComment))
  api.route('/v1/activities/:activityId/comments/:commentId').get(wrapAsync(CommentsAPI.getComment))
  api.route('/v1/activities/:activityId/comments/:commentId').put(wrapAsync(CommentsAPI.updateComment))
  api.route('/v1/activities/:activityId/comments/:commentId').delete(wrapAsync(CommentsAPI.archiveComment))
  api.route('/v1/activities/:activityId/comments/:commentId/unarchive').put(wrapAsync(CommentsAPI.unarchiveComment))

  // -- Likes routes
  api.route('/v1/activities/:activityId/like').post(wrapAsync(LikesAPI.likeActivity))
  api.route('/v1/activities/:activityId/unlike').delete(wrapAsync(LikesAPI.unlikeActivity))
  api.route('/v1/activities/:activityId/comments/:commentId/like').post(wrapAsync(LikesAPI.likeComment))
  api.route('/v1/activities/:activityId/comments/:commentId/unlike').delete(wrapAsync(LikesAPI.unlikeComment))

  // -- Utilities routes
  api.route('/v1/search').get(wrapAsync(SearchAPI.mainSearch))

  // -- Chats routes
  api.route('/v1/chats').post(wrapAsync(ChatsAPI.createChat))
  api.route('/v1/chats/:chatId/conversation').post(wrapAsync(ChatsAPI.createConversation))
  api.route('/v1/chats/:chatId/invite').put(wrapAsync(ChatsAPI.chatInvite))
  api.route('/v1/chats/:chatId/removeUser').put(wrapAsync(ChatsAPI.chatRemoveUser))
  api.route('/v1/chats/:chatId/updateTitle').put(wrapAsync(ChatsAPI.updateChatTitle))
  api.route('/v1/chats/:chatId/conversation/:messageId').delete(wrapAsync(ChatsAPI.archiveChatMessage))
  api.route('/v1/getChatByMemberIds').get(wrapAsync(ChatsAPI.getChatByMemberIds))

  // -- Orders routes
  api.route('/v1/orders').post(wrapAsync(OrdersAPI.createOrder))
  api.route('/v1/orders/:orderId/confirm').put(wrapAsync(OrdersAPI.confirmOrder))
  api.route('/v1/orders/:orderId/pay').put(wrapAsync(OrdersAPI.pay))
  api.route('/v1/orders/:orderId/confirmPayment').put(wrapAsync(OrdersAPI.confirmPayment))
  api.route('/v1/orders/:orderId/shipOut').put(wrapAsync(OrdersAPI.shipOut))
  api.route('/v1/orders/:orderId/receive').put(wrapAsync(OrdersAPI.receive))
  api.route('/v1/orders/:orderId/decline').put(wrapAsync(OrdersAPI.decline))
  api.route('/v1/orders/:orderId/cancel').put(wrapAsync(OrdersAPI.cancel))

  // -- Product Subscription Plans routes
  api.route('/v1/productSubscriptionPlans').post(wrapAsync(ProductSubscriptionPlansAPI.createProductSubscriptionPlan))
  api.route('/v1/productSubscriptionPlans/:id/confirm').put(wrapAsync(ProductSubscriptionPlansAPI.confirm))

  // -- Product Subscriptions routes
  api.route('/v1/productSubscriptions/:id/createOrder').post(wrapAsync(ProductSubscriptionsAPI.createOrderFromSubscription))
}

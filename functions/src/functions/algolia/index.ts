const usersIndex = require('./usersIndex')
const chatsIndex = require('./chatsIndex')
const conversationsIndex = require('./conversationsIndex')
const ordersIndex = require('./ordersIndex')
const productsIndex = require('./productsIndex')
const productSubscriptionPlansIndex = require('./productSubscriptionPlansIndex')
const shopsIndex = require('./shopsIndex')
const activitiesIndex = require('./activitiesIndex')
const commentsIndex = require('./commentsIndex')
const communitiesIndex = require('./communitiesIndex')

exports.addUserIndex = usersIndex.addUserIndex
exports.updateUserIndex = usersIndex.updateUserIndex
exports.deleteUserIndex = usersIndex.deleteUserIndex

exports.addChatIndex = chatsIndex.addChatIndex
exports.updateChatIndex = chatsIndex.updateChatIndex
exports.deleteChatIndex = chatsIndex.deleteChatIndex

exports.addConversationIndex = conversationsIndex.addConversationIndex
exports.updateConversationIndex = conversationsIndex.updateConversationIndex
exports.deleteConversationIndex = conversationsIndex.deleteConversationIndex

exports.addOrderIndex = ordersIndex.addOrderIndex
exports.updateOrderIndex = ordersIndex.updateOrderIndex
exports.deleteOrderIndex = ordersIndex.deleteOrderIndex

exports.addProductIndex = productsIndex.addProductIndex
exports.updateProductIndex = productsIndex.updateProductIndex
exports.deleteProductIndex = productsIndex.deleteProductIndex

exports.addProductSubscriptionPlanIndex = productSubscriptionPlansIndex.addProductSubscriptionPlanIndex
exports.updateProductSubscriptionPlanIndex = productSubscriptionPlansIndex.updateProductSubscriptionPlanIndex
exports.deleteProductSubscriptionPlanIndex = productSubscriptionPlansIndex.deleteProductSubscriptionPlanIndex

exports.addShopIndex = shopsIndex.addShopIndex
exports.updateShopIndex = shopsIndex.updateShopIndex
exports.deleteShopIndex = shopsIndex.deleteShopIndex

exports.addActivityIndex = activitiesIndex.addActivityIndex
exports.updateActivityIndex = activitiesIndex.updateActivityIndex
exports.deleteActivityIndex = activitiesIndex.deleteActivityIndex

exports.addCommentIndex = commentsIndex.addCommentIndex
exports.updateCommentIndex = commentsIndex.updateCommentIndex
exports.deleteCommentIndex = commentsIndex.deleteCommentIndex

exports.addCommunityIndex = communitiesIndex.addCommunityIndex
exports.updateCommunityIndex = communitiesIndex.updateCommunityIndex
exports.deleteCommunityIndex = communitiesIndex.deleteCommunityIndex

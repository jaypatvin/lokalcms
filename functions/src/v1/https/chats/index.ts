/**
 * @openapi
 * components:
 *   schemas:
 *     Chat:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         members:
 *           type: array
 *           items:
 *             type: string
 *         community_id:
 *           type: string
 *         shop_id:
 *           type: string
 *         product_id:
 *           type: string
 *         conversation:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               message:
 *                 type: string
 *               sent_at:
 *                 type: string
 *     ChatMessage:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *         message:
 *           type: string
 *         media:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               type:
 *                 type: string
 *               order:
 *                 type: number
 *         sent_at:
 *           type: string
 */

export const required_fields = ['members']

export { default as createChat } from './createChat'
export { default as chatInvite } from './chatInvite'
export { default as chatRemoveUser } from './chatRemoveUser'
export { default as updateChatTitle } from './updateChatTitle'
export { default as archiveChatMessage } from './archiveChatMessage'

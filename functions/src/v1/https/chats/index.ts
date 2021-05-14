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
 */

export const required_fields = ['members']

export { default as createChat } from './createChat'

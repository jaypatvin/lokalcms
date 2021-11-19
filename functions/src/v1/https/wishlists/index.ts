/**
 * @openapi
 * components:
 *   schemas:
 *     Wishlist:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *         shop_id:
 *           type: string
 *         community_id:
 *           type: string
 *         created_at:
 *           type: string
 */

export { default as addToWishlist } from './addToWishlist'
export { default as removeFromWishlist } from './removeFromWishlist'

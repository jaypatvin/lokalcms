/**
 * @openapi
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *         message:
 *           type: string
 *         order_id:
 *           type: string
 *         created_at:
 *           type: string
 *         updated_at:
 *           type: string
 *         rating:
 *           type: number
 */

export { default as getProductReviews } from './getProductReviews'
export { default as getUserReviews } from './getUserReviews'
export { default as getOrderProductsReviews } from './getOrderProductsReviews'
export { default as getReviews } from './getReviews'

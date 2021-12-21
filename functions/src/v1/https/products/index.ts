/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         shop_id:
 *           type: string
 *         user_id:
 *           type: string
 *         community_id:
 *           type: string
 *         base_price:
 *           type: number
 *         quantity:
 *           type: number
 *         product_category:
 *           type: string
 *         status:
 *           type: string
 *         gallery:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *             order:
 *               type: number
 *         availability:
 *           type: object
 *           properties:
 *             start_time:
 *               type: string
 *             end_time:
 *               type: string
 *             repeat:
 *               type: string
 *             start_dates:
 *               type: array
 *               items:
 *                 type: string
 *             schedule:
 *               type: object
 *               properties:
 *                 custom:
 *                   type: object
 *                   properties:
 *                     YYYY-MM-DD:
 *                       type: object
 *                       properties:
 *                         unavailable:
 *                           type: boolean
 *                         start_time:
 *                           type: string
 *                         end_time:
 *                           type: string
 *                 mon:
 *                   type: object
 *                   properties:
 *                     start_date:
 *                       type: string
 *                     repeat:
 *                       type: string
 *                 tue:
 *                   type: object
 *                   properties:
 *                     start_date:
 *                       type: string
 *                     repeat:
 *                       type: string
 *                 wed:
 *                   type: object
 *                   properties:
 *                     start_date:
 *                       type: string
 *                     repeat:
 *                       type: string
 *                 thu:
 *                   type: object
 *                   properties:
 *                     start_date:
 *                       type: string
 *                     repeat:
 *                       type: string
 *                 fri:
 *                   type: object
 *                   properties:
 *                     start_date:
 *                       type: string
 *                     repeat:
 *                       type: string
 *                 sat:
 *                   type: object
 *                   properties:
 *                     start_date:
 *                       type: string
 *                     repeat:
 *                       type: string
 *                 sun:
 *                   type: object
 *                   properties:
 *                     start_date:
 *                       type: string
 *                     repeat:
 *                       type: string
 */

export const required_fields = [
  'name',
  'description',
  'shop_id',
  'base_price',
  'quantity',
  'product_category',
]

export { default as createProduct } from './createProduct'
export { default as updateProduct } from './updateProduct'
export { default as archiveProduct } from './archiveProduct'
export { default as unarchiveProduct } from './unarchiveProduct'
export { default as getProduct } from './getProduct'
export { default as getProducts } from './getProducts'
export { default as getAvailableProducts } from './getAvailableProducts'
export { default as getCommunityProducts } from './getCommunityProducts'
export { default as getUserProducts } from './getUserProducts'
export { default as addProductAvailability } from './addProductAvailability'
export { default as getProductAvailability } from './getProductAvailability'
export { default as getDates } from './getDates'
export { default as getRecommendedProducts } from './getRecommendedProducts'
export { default as getUserWishlist } from './getUserWishlist'
export { default as addProductReview } from './addProductReview'

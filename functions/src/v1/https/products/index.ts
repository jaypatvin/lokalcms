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
export { default as getCommunityProducts } from './getCommunityProducts'
export { default as getUserProducts } from './getUserProducts'
export { default as addProductAvailability } from './addProductAvailability'
export { default as getProductAvailability } from './getProductAvailability'

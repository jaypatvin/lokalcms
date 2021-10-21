/**
 * @openapi
 * components:
 *   schemas:
 *     Like:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *         created_at:
 *           type: string
 */

export { default as likeActivity } from './likeActivity'
export { default as unlikeActivity } from './unlikeActivity'
export { default as likeComment } from './likeComment'
export { default as unlikeComment } from './unlikeComment'
export { default as likeProduct } from './likeProduct'
export { default as unlikeProduct } from './unlikeProduct'
export { default as likeShop } from './likeShop'
export { default as unlikeShop } from './unlikeShop'

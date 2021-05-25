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

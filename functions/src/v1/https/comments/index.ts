/**
 * @openapi
 * components:
 *   schemas:
 *     Community:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         user_id:
 *           type: string
 *         message:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               order:
 *                 type: number
 */

 export const required_fields = ['user_id']

export { default as createComment } from './createComment'
export { default as updateComment } from './updateComment'
export { default as archiveComment } from './archiveComment'
export { default as unarchiveComment } from './unarchiveComment'
export { default as getComment } from './getComment'
export { default as getUserComments } from './getUserComments'
export { default as getActivityComments } from './getActivityComments'

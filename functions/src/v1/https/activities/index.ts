/**
 * @openapi
 * components:
 *   schemas:
 *     Activity:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         community_id:
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
 *         comments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user_id: string
 *               message: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     order:
 *                       type: number
 *         liked:
 *           type: object
 *           properties:
 *             _meta:
 *               type: array
 *               items:
 *                 type: string
 *         status:
 *           type: string
 */

export { default as createActivity } from './createActivity'
export { default as updateActivity } from './updateActivity'
export { default as archiveActivity } from './archiveActivity'
export { default as unarchiveActivity } from './unarchiveActivity'
export { default as getActivity } from './getActivity'
export { default as getActivities } from './getActivities'
export { default as getUserActivities } from './getUserActivities'
export { default as getCommunityActivities } from './getCommunityActivities'

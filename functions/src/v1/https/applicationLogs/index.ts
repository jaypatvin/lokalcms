/**
 * @openapi
 * components:
 *   schemas:
 *     ApplicationLog:
 *       type: object
 *       properties:
 *         is_authenticated:
 *           type: boolean
 *         user_id:
 *           type: string
 *         community_id:
 *           type: string
 *         action_type:
 *           type: string
 *         device_id:
 *           type: string
 *         associated_document:
 *           type: string
 *         metadata:
 *           type: object
 *         created_at:
 *           type: string
 *           format: date-time
 *         archived:
 *           type: boolean
 */

export { default as createApplicationLog } from './createApplicationLog'

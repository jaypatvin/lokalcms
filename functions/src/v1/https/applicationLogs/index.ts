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

export const required_fields = ['action_type', 'device_id', 'community_id', ]

export { default as createApplicationLog } from './createApplicationLog'

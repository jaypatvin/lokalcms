/**
 * @openapi
 * components:
 *   schemas:
 *     Invite:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         claimed:
 *           type: boolean
 *         code:
 *           type: string
 *         community_id:
 *           type: string
 *         expire_by:
 *           type: number
 *         invitee_email:
 *           type: string
 *         inviter:
 *           type: string
 *         status:
 *           type: string
 */

export const required_fields = ['email', 'user_id']

export { default as createInvite } from './createInvite'
export { default as checkInvite } from './checkInvite'
export { default as claimInvite } from './claimInvite'
export { default as getInvites } from './getInvites'

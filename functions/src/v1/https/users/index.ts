/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         display_name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         profile_photo:
 *           type: string
 *         status:
 *           type: string
 *         birthdate:
 *           type: string
 *           format: date
 *         community_id:
 *           type: string
 *         address:
 *           type: object
 *           properties:
 *             barangay:
 *               type: string
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             subdivision:
 *               type: string
 *             zip_code:
 *               type: string
 *             country:
 *               type: string
 *         roles:
 *           type: object
 *           properties:
 *             admin:
 *               type: boolean
 *             editor:
 *               type: boolean
 *             member:
 *               type: boolean
 *         registration:
 *           type: object
 *           properties:
 *             id_photo:
 *               type: string
 *             id_type:
 *               type: string
 *             notes:
 *               type: string
 *             step:
 *               type: number
 *             verified:
 *               type: boolean
 *         user_uids:
 *           type: array
 *           items:
 *             type: string
 */

export const required_fields = ['email', 'first_name', 'last_name', 'street', 'community_id']

export { default as createUser } from './createUser'
export { default as updateUser } from './updateUser'
export { default as archiveUser } from './archiveUser'
export { default as unarchiveUser } from './unarchiveUser'
export { default as getUser } from './getUser'
export { default as getUsers } from './getUsers'
export { default as getUsersByCommunityId } from './getUsersByCommunityId'

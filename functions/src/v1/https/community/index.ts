/**
 * @openapi
 * components:
 *   schemas:
 *     Community:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         profile_photo:
 *           type: string
 *         cover_photo:
 *           type: string
 *         archived:
 *           type: boolean
 *         address:
 *           type: object
 *           properties:
 *             barangay:
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
 */

export { default as createCommunity } from './createCommunity'
export { default as updateCommunity } from './updateCommunity'
export { default as deleteCommunity } from './deleteCommunity'
export { default as unarchiveCommunity } from './unarchiveCommunity'
export { default as getCommunities } from './getCommunities'
export { default as getCommunity } from './getCommunity'

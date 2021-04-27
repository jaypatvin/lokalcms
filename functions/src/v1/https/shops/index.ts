/**
 * @openapi
 * components:
 *   schemas:
 *     Shop:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         user_id:
 *           type: string
 *         community_id:
 *           type: string
 *         is_close:
 *           type: boolean
 *         status:
 *           type: string
 *         operating_hours:
 *           type: object
 *           properties:
 *             opening:
 *               type: string
 *             closing:
 *               type: string
 *             custom:
 *               type: boolean
 *             mon:
 *               type: object
 *               properties:
 *                 opening:
 *                   type: string
 *                 closing:
 *                   type: string
 *             tue:
 *               type: object
 *               properties:
 *                 opening:
 *                   type: string
 *                 closing:
 *                   type: string
 *             wed:
 *               type: object
 *               properties:
 *                 opening:
 *                   type: string
 *                 closing:
 *                   type: string
 *             thu:
 *               type: object
 *               properties:
 *                 opening:
 *                   type: string
 *                 closing:
 *                   type: string
 *             fri:
 *               type: object
 *               properties:
 *                 opening:
 *                   type: string
 *                 closing:
 *                   type: string
 *             sat:
 *               type: object
 *               properties:
 *                 opening:
 *                   type: string
 *                 closing:
 *                   type: string
 *             sun:
 *               type: object
 *               properties:
 *                 opening:
 *                   type: string
 *                 closing:
 *                   type: string
 */

export const required_fields = ['name', 'description', 'user_id', 'operating_hours']

export { default as createShop } from './createShop'
export { default as updateShop } from './updateShop'
export { default as archiveShop } from './archiveShop'
export { default as unarchiveShop } from './unarchiveShop'
export { default as getShops } from './getShops'
export { default as getUserShops } from './getUserShops'
export { default as getCommunityShops } from './getCommunityShops'
export { default as getShop } from './getShop'
export { default as addShopOperatingHours } from './addShopOperatingHours'
export { default as getShopOperatingHours } from './getShopOperatingHours'

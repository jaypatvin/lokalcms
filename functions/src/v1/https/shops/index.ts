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
 *         delivery_options:
 *           type: object
 *           properties:
 *             delivery:
 *               type: boolean
 *               required: true
 *             pickup:
 *               type: boolean
 *               required: true
 *         operating_hours:
 *           type: object
 *           properties:
 *             start_time:
 *               type: string
 *             end_time:
 *               type: string
 *             repeat:
 *               type: string
 *             start_dates:
 *               type: array
 *               items:
 *                 type: string
 *             schedule:
 *               type: object
 *               properties:
 *                 custom:
 *                   type: object
 *                   properties:
 *                     YYYY-MM-DD:
 *                       type: object
 *                       properties:
 *                         unavailable:
 *                           type: boolean
 *                         start_time:
 *                           type: string
 *                         end_time:
 *                           type: string
 *                 mon:
 *                   type: object
 *                   properties:
 *                     start_date:
 *                       type: string
 *                     repeat:
 *                       type: string
 *                 tue:
 *                   type: object
 *                   properties:
 *                     start_date:
 *                       type: string
 *                     repeat:
 *                       type: string
 *                 wed:
 *                   type: object
 *                   properties:
 *                     start_date:
 *                       type: string
 *                     repeat:
 *                       type: string
 *                 thu:
 *                   type: object
 *                   properties:
 *                     start_date:
 *                       type: string
 *                     repeat:
 *                       type: string
 *                 fri:
 *                   type: object
 *                   properties:
 *                     start_date:
 *                       type: string
 *                     repeat:
 *                       type: string
 *                 sat:
 *                   type: object
 *                   properties:
 *                     start_date:
 *                       type: string
 *                     repeat:
 *                       type: string
 *                 sun:
 *                   type: object
 *                   properties:
 *                     start_date:
 *                       type: string
 *                     repeat:
 *                       type: string
 */

export { default as createShop } from './createShop'
export { default as updateShop } from './updateShop'
export { default as archiveShop } from './archiveShop'
export { default as unarchiveShop } from './unarchiveShop'
export { default as getShops } from './getShops'
export { default as getAvailableShops } from './getAvailableShops'
export { default as getUserShops } from './getUserShops'
export { default as getCommunityShops } from './getCommunityShops'
export { default as getShop } from './getShop'
export { default as addShopOperatingHours } from './addShopOperatingHours'
export { default as getShopOperatingHours } from './getShopOperatingHours'
export { default as getDates } from './getDates'

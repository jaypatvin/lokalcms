/**
 * @openapi
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *         reported_user_id:
 *           type: string
 *         description:
 *           type: string
 *         community_id:
 *           type: string
 *         activity_id:
 *           type: string
 *         shop_id:
 *           type: string
 *         product_id:
 *           type: string
 *         created_at:
 *           type: string
 *         updated_at:
 *           type: string
 */

export { default as getReports } from './getReports'

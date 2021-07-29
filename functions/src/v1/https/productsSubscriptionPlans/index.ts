/**
 * @openapi
 * components:
 *   schemas:
 *     ProductSubscriptionPlan:
 *       type: object
 *       properties:
 *         product_id:
 *           type: string
 *         shop_id:
 *           type: string
 *         user_id:
 *           type: string
 *         quantity:
 *           type: number
 *         instruction:
 *           type: string
 *         plan:
 *           type: object
 *           properties:
 *             start_dates:
 *               type: array
 *               items:
 *                 type: string
 *             last_date:
 *               type: string
 *             repeat_unit:
 *               type: number
 *             repeat_type:
 *               type: string
 *               enum: [day, week, month]
 *             schedule:
 *               type: object
 *               properties:
 *                 mon:
 *                   type: object
 *                   properties:
 *                     start_date:
 *                       type: string
 *                 tue:
 *                   type: object
 *                   properties:
 *                     start_date:
 *                       type: string
 *                 wed:
 *                   type: object
 *                   properties:
 *                     start_date:
 *                       type: string
 *                 thu:
 *                   type: object
 *                   properties:
 *                     start_date:
 *                       type: string
 *                 fri:
 *                   type: object
 *                   properties:
 *                     start_date:
 *                       type: string
 *                 sat:
 *                   type: object
 *                   properties:
 *                     start_date:
 *                       type: string
 *                 sun:
 *                   type: object
 *                   properties:
 *                     start_date:
 *                       type: string
 *         product:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             description:
 *               type: string
 *             price:
 *               type: number
 *             image:
 *               type: string
 *         shop:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             description:
 *               type: string
 */

export const required_fields = ['product_id', 'shop_id', 'user_id', 'quantity', 'plan']

export { default as createProductSubscriptionPlan } from './createProductSubscriptionPlan'

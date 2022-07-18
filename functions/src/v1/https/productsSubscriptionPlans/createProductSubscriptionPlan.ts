import { RequestHandler } from 'express'
import { get } from 'lodash'
import { ProductSubscriptionPlanCreateData } from '../../../models/ProductSubscriptionPlan'
import {
  UsersService,
  ShopsService,
  ProductsService,
  ProductSubscriptionPlansService,
} from '../../../service'
import {
  ErrorCode,
  generateError,
  generateNotFoundError,
  generateSubscriptionPlanSchedule,
} from '../../../utils/generators'

/**
 * @openapi
 * /v1/productSubscriptionPlans:
 *   post:
 *     tags:
 *       - product subscription plans
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will create a new product subscription plan.
 *       # Examples
 *       ## creating a subscription plan every monday starting july 26, 2021
 *       ```
 *       {
 *         "product_id": "product-id-1",
 *         "buyer_id": "user-id-1",
 *         "shop_id": "shop-id-1",
 *         "quantity": 10,
 *         "instruction": "please take care of it",
 *         "payment_method": "cod",
 *         "plan": {
 *           "start_dates": ["2021-07-26"],
 *           "repeat_unit": 1,
 *           "repeat_type": "week"
 *         }
 *       }
 *       ```
 *
 *       ## creating a subscription plan every 10th day of every 2 months starting july
 *       ```
 *       {
 *         "product_id": "product-id-1",
 *         "buyer_id": "user-id-1",
 *         "shop_id": "shop-id-1",
 *         "quantity": 5,
 *         "payment_method": "cod",
 *         "plan": {
 *           "start_dates": ["2021-07-10"],
 *           "repeat_unit": 2,
 *           "repeat_type": "month"
 *         }
 *       }
 *       ```
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *                 required: true
 *               shop_id:
 *                 type: string
 *                 required: true
 *               buyer_id:
 *                 type: string
 *                 required: true
 *               quantity:
 *                 type: number
 *                 required: true
 *               instruction:
 *                 type: string
 *               payment_method:
 *                 type: string
 *                 required: true
 *                 enum: [cod, bank, e-wallet]
 *               plan:
 *                 type: object
 *                 required: true
 *                 properties:
 *                   start_dates:
 *                     type: array
 *                     required: true
 *                     items:
 *                       type: string
 *                   last_date:
 *                     type: string
 *                   repeat_unit:
 *                     type: number
 *                     required: true
 *                   repeat_type:
 *                     type: string
 *                     required: true
 *                     description: This can also be like every first monday (1-mon), or third tuesday (3-tue) of the month
 *                     enum: [day, week, month, 1-mon, 2-wed, 3-tue, 2-fri, 4-sun, 5-thu, 1-sat]
 *                   auto_reschedule:
 *                     type: boolean
 *                     default: false
 *                   override_dates:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         original_date:
 *                           type: string
 *                           required: true
 *                         new_date:
 *                           type: string
 *                           required: true
 *     responses:
 *       200:
 *         description: The new ProductSubscriptionPlan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/ProductSubscriptionPlan'
 */
const createProductSubscriptionPlan: RequestHandler = async (req, res) => {
  const data = req.body
  const { product_id, shop_id, buyer_id, quantity, instruction = '', plan, payment_method } = data
  const roles = res.locals.userRoles
  let { id: requestorDocId, community_id } = res.locals.userDoc
  let buyer
  if (buyer_id && requestorDocId !== buyer_id) {
    if (!roles.editor) {
      throw generateError(ErrorCode.ProductSubscriptionPlanApiError, {
        message:
          'User does not have a permission to create a product subscription plan for another user',
      })
    } else {
      buyer = await UsersService.findById(buyer_id)
      if (!buyer) {
        throw generateNotFoundError(ErrorCode.ProductSubscriptionPlanApiError, 'User', buyer_id)
      }
      requestorDocId = buyer_id
      community_id = buyer.community_id
    }
  }

  const product = await ProductsService.findById(product_id)
  if (!product) {
    throw generateNotFoundError(ErrorCode.ProductSubscriptionPlanApiError, 'Product', product_id)
  }
  if (!product.can_subscribe) {
    throw generateError(ErrorCode.ProductSubscriptionPlanApiError, {
      message: `The product with id "${product_id}" is not available for subscription`,
    })
  }

  const shop = await ShopsService.findById(shop_id)
  if (!shop) {
    throw generateNotFoundError(ErrorCode.ProductSubscriptionPlanApiError, 'Shop', shop_id)
  }

  const {
    start_dates,
    last_date = '',
    repeat_unit,
    repeat_type,
    auto_reschedule = false,
    override_dates,
  } = plan

  const newPlan: ProductSubscriptionPlanCreateData = {
    product_id,
    shop_id,
    buyer_id: requestorDocId,
    seller_id: shop.user_id,
    community_id,
    quantity,
    instruction,
    archived: false,
    status: 'disabled',
    payment_method,
    plan: {
      start_dates,
      last_date,
      repeat_unit,
      repeat_type,
      auto_reschedule,
      schedule: generateSubscriptionPlanSchedule({ start_dates, repeat_type }),
    },
    product: {
      name: product.name,
      description: product.description,
      price: product.base_price,
      image: get(product, 'gallery[0].url', ''),
    },
    shop: {
      name: shop.name,
      description: shop.description,
      image: shop.profile_photo || '',
    },
  }

  if (override_dates && override_dates.length) {
    override_dates.forEach(({ original_date, new_date }) => {
      if (!newPlan.plan.override_dates) newPlan.plan.override_dates = {}
      newPlan.plan.override_dates[original_date] = new_date
    })
  }

  const result = await ProductSubscriptionPlansService.create(newPlan)

  return res.json({ status: 'ok', data: result })
}

export default createProductSubscriptionPlan

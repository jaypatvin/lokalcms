import { Request, Response } from 'express'
import { get, includes } from 'lodash'
import {
  UsersService,
  ShopsService,
  ProductsService,
  CommunityService,
  ProductSubscriptionPlansService,
} from '../../../service'
import generateSubscriptionPlanSchedule from '../../../utils/generateSubscriptionPlanSchedule'
import validateFields from '../../../utils/validateFields'
import validateSubscriptionPlan from '../../../utils/validateSubscriptionPlan'
import { payment_methods, required_fields } from './index'

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
const createProductSubscriptionPlan = async (req: Request, res: Response) => {
  const data = req.body
  const { product_id, shop_id, buyer_id, quantity, instruction = '', plan, payment_method } = data
  const roles = res.locals.userRoles
  let { id: requestorDocId, community_id } = res.locals.userDoc
  let buyer
  if (buyer_id && requestorDocId !== buyer_id) {
    if (!roles.editor) {
      return res.status(403).json({
        status: 'error',
        message:
          'You do not have a permission to create a product subscription plan for another user.',
      })
    } else {
      buyer = await UsersService.getUserByID(buyer_id)
      if (!buyer) {
        return res
          .status(400)
          .json({ status: 'error', message: `User with id ${buyer_id} does not exist.` })
      }
      requestorDocId = buyer_id
      community_id = buyer.community_id
    }
  }

  const error_fields = validateFields(data, required_fields)
  if (error_fields.length) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Required fields missing', error_fields })
  }

  if (!includes(payment_methods, payment_method)) {
    return res.status(403).json({
      status: 'error',
      message: `${payment_method} is not a valid payment_method. "cod" | "bank" | "e-wallet"`,
    })
  }

  const product = await ProductsService.getProductByID(product_id)
  if (!product) return res.status(400).json({ status: 'error', message: 'Invalid Product ID!' })

  const shop = await ShopsService.getShopByID(shop_id)
  if (!shop) return res.status(400).json({ status: 'error', message: 'Invalid Shop ID!' })

  const validation = validateSubscriptionPlan(data.plan)
  if (!validation.valid) {
    return res.status(400).json({
      status: 'error',
      ...validation,
    })
  }

  const { start_dates, repeat_type } = plan

  const newPlan = {
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
      ...plan,
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

  let result: any = await ProductSubscriptionPlansService.createProductSubscriptionPlan(newPlan)
  result = await result.get().then((doc) => doc.data())

  return res.json({ status: 'ok', data: result })
}

export default createProductSubscriptionPlan

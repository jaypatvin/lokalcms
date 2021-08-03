import { Request, Response } from 'express'
import { get } from 'lodash'
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
import { required_fields } from './index'

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
 *               shop_id:
 *                 type: string
 *               buyer_id:
 *                 type: string
 *               quantity:
 *                 type: number
 *               instruction:
 *                 type: string
 *               plan:
 *                 type: object
 *                 properties:
 *                   start_dates:
 *                     type: array
 *                     items:
 *                       type: string
 *                   last_date:
 *                     type: string
 *                   repeat_unit:
 *                     type: number
 *                   repeat_type:
 *                     type: string
 *                     enum: [day, week, month]
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
  const { product_id, shop_id, buyer_id, quantity, instruction = '', plan } = data
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  if (!roles.editor && requestorDocId !== buyer_id) {
    return res.status(403).json({
      status: 'error',
      message:
        'You do not have a permission to create a product subscription plan for another user.',
    })
  }

  const error_fields = validateFields(data, required_fields)
  if (error_fields.length) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Required fields missing', error_fields })
  }

  const user = await UsersService.getUserByID(buyer_id)
  if (!user) return res.status(400).json({ status: 'error', message: 'Invalid User ID!' })

  const community = await CommunityService.getCommunityByID(user.community_id)
  if (!community) {
    return res.status(400).json({
      status: 'error',
      message: `Community of user ${user.email} does not exist!`,
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
    buyer_id,
    seller_id: shop.user_id,
    community_id: community.id,
    quantity,
    instruction,
    archived: false,
    status: 'disabled',
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

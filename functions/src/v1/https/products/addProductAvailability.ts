import { Request, Response } from 'express'
import _ from 'lodash'
import { ProductUpdateData } from '../../../models/Product'
import { ProductsService, ShopsService } from '../../../service'
import { generateSchedule } from '../../../utils/generators'
import { isScheduleDerived, validateOperatingHours } from '../../../utils/validations'

/**
 * @openapi
 * /v1/products/{productId}/availability:
 *   put:
 *     tags:
 *       - products
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ## The product availability must derive correctly from the shop's schedule, otherwise it will fail.
 *       # Examples
 *       ## available on 2021-04-28 and every 3 days after
 *       ```
 *       {
 *         "start_time": "09:00 AM",
 *         "end_time": "03:00 PM",
 *         "start_dates": [
 *           "2021-04-28"
 *         ],
 *         "repeat_unit": 3,
 *         "repeat_type": "day"
 *       }
 *       ```
 *
 *       ## available on mon, wed, fri starting at 2021-04-26, 2021-04-28, 2021-04-30, every other week and also one time available on 2021-04-29
 *       ```
 *       {
 *         "start_time": "08:00 AM",
 *         "end_time": "04:00 PM",
 *         "start_dates": [
 *           "2021-04-26",
 *           "2021-04-28",
 *           "2021-04-30"
 *         ],
 *         "repeat_unit": 2,
 *         "repeat_type": "week",
 *         "custom_dates": [
 *           {
 *             "date": "2021-04-29"
 *           }
 *         ]
 *       }
 *       ```
 *
 *       ## available on mon, wed starting at 2021-05-03, 2021-05-05, every week, but not on 2021-05-10, and have an early end time on 2021-05-19
 *       ```
 *       {
 *         "start_time": "08:00 AM",
 *         "end_time": "04:00 PM",
 *         "start_dates": [
 *           "2021-05-03",
 *           "2021-05-05"
 *         ],
 *         "repeat_unit": 1,
 *         "repeat_type": "week",
 *         "unavailable_dates": [
 *           "2021-05-10"
 *         ],
 *         "custom_dates": [
 *           {
 *             "date": "2021-05-19",
 *             "end_time": "01:00 PM"
 *           }
 *         ]
 *       }
 *       ```
 *
 *       ## available on 2021-05-03 and every month
 *       ```
 *       {
 *         "start_time": "08:00 AM",
 *         "end_time": "04:00 PM",
 *         "start_dates": [
 *           "2021-05-03",
 *         ],
 *         "repeat_unit": 1,
 *         "repeat_type": "month"
 *       }
 *       ```
 *
 *       ## available on every 2nd monday of every month
 *       ```
 *       {
 *         "start_time": "08:00 AM",
 *         "end_time": "04:00 PM",
 *         "start_dates": [
 *           "2021-05-10"
 *         ],
 *         "repeat_unit": 1,
 *         "repeat_type": "2-mon"
 *       }
 *       ```
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: document id of the product
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               start_time:
 *                 type: string
 *               end_time:
 *                 type: string
 *               start_dates:
 *                 type: array
 *                 required: true
 *                 items:
 *                   type: string
 *               repeat_unit:
 *                 type: number
 *                 required: true
 *               repeat_type:
 *                 type: string
 *                 required: true
 *                 description: This can also be like every first monday (1-mon), or third tuesday (3-tue) of the month
 *                 enum: [day, week, month, 1-mon, 2-wed, 3-tue, 2-fri, 4-sun, 5-thu, 1-sat]
 *               unavailable_dates:
 *                 type: array
 *                 items:
 *                   type: string
 *               custom_dates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       required: true
 *                     start_time:
 *                       type: string
 *                     end_time:
 *                       type: string
 *     responses:
 *       200:
 *         description: Updated product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const addProductAvailability = async (req: Request, res: Response) => {
  const { productId } = req.params
  const data = req.body

  if (!productId) return res.status(400).json({ status: 'error', message: 'id is required!' })

  // check if product exists
  const product = await ProductsService.getProductByID(productId)
  if (!product) return res.status(400).json({ status: 'error', message: 'Invalid Product Id!' })

  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  if (!roles.editor && requestorDocId !== product.user_id) {
    return res.status(400).json({
      status: 'error',
      message: 'You do not have a permission to update a product of another user.',
    })
  }

  const updateData: ProductUpdateData = {
    updated_by: requestorDocId || '',
    updated_from: data.source || '',
  }

  const {
    start_time,
    end_time,
    start_dates,
    repeat_unit,
    repeat_type,
    unavailable_dates,
    custom_dates,
  } = data

  updateData.availability = {
    start_time,
    end_time,
    start_dates,
    repeat_type,
    repeat_unit,
    schedule: generateSchedule({
      start_time,
      end_time,
      start_dates,
      repeat_type,
      repeat_unit,
      unavailable_dates,
      custom_dates,
    }),
  }

  // check if product availability is derived correctly from the shop's operating hours
  const shop = await ShopsService.getShopByID(product.shop_id)
  const productAvailability = updateData.availability
  const shopOperatingHours = shop.operating_hours
  if (!isScheduleDerived(productAvailability, shopOperatingHours)) {
    return res.status(400).json({
      status: 'error',
      message: 'The product availability must be derived from the shop schedule.',
    })
  }

  const result = await ProductsService.updateProduct(productId, updateData)

  return res.json({ status: 'ok', data: result })
}

export default addProductAvailability

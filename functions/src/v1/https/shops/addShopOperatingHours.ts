import { RequestHandler } from 'express'
import { ShopUpdateData } from '../../../models/Shop'
import { ProductsService, ShopsService } from '../../../service'
import {
  ErrorCode,
  generateError,
  generateNotFoundError,
  generateSchedule,
} from '../../../utils/generators'

/**
 * @openapi
 * /v1/shops/{shopId}/operatingHours:
 *   put:
 *     tags:
 *       - shops
 *     security:
 *       - bearerAuth: []
 *     description: |
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
 *           "2021-05-03"
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
 *         name: shopId
 *         required: true
 *         description: document id of the shop
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
 *                 items:
 *                   type: string
 *               repeat_unit:
 *                 type: number
 *               repeat_type:
 *                 type: string
 *                 enum: [day, week, month, n-day]
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
 *                     start_time:
 *                       type: string
 *                     end_time:
 *                       type: string
 *     responses:
 *       200:
 *         description: Updated shop
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const addShopOperatingHours: RequestHandler = async (req, res, next) => {
  const { shopId } = req.params
  const data = req.body

  const shop = await ShopsService.getShopByID(shopId)
  if (!shop) {
    return next(generateNotFoundError(ErrorCode.ShopApiError, 'Shop', shopId))
  }

  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  if (!roles.editor && requestorDocId !== shop.user_id) {
    return next(
      generateError(ErrorCode.ShopApiError, {
        message: 'User does not have a permission to update a shop of another user',
      })
    )
  }

  const updateData: ShopUpdateData = {
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

  updateData.operating_hours = {
    start_time,
    end_time,
    start_dates,
    repeat_unit,
    repeat_type,
    schedule: generateSchedule({
      start_time,
      end_time,
      start_dates,
      repeat_unit,
      repeat_type,
      unavailable_dates,
      custom_dates,
    }),
  }

  const result = await ShopsService.updateShop(shopId, updateData)

  const shopProducts = await ProductsService.getProductsByShopID(shopId)
  for (const product of shopProducts) {
    const productId = product.id
    await ProductsService.updateProduct(productId, { availability: updateData.operating_hours })
  }

  return res.json({ status: 'ok', data: result })
}

export default addShopOperatingHours

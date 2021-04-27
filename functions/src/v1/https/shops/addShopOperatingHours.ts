import { Request, Response } from 'express'
import _ from 'lodash'
import { ShopsService } from '../../../service'
import generateSchedule from '../../../utils/generateSchedule'
import validateOperatingHours from '../../../utils/validateOperatingHours'

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
 *       ## open only on 2021-04-28
 *       ```
 *       {
 *         "operating_hours": {
 *           "start_time": "09:00 AM",
 *           "end_time": "03:00 PM",
 *           "start_dates": [
 *             "2021-04-28"
 *           ],
 *           "repeat": "none"
 *         }
 *       }
 *       ```
 *
 *       ## open on mon, wed, fri starting at 2021-04-26, 2021-04-28, 2021-04-30, every other week and also one time open on 2021-04-29
 *       ```
 *       {
 *         "operating_hours": {
 *           "start_time": "08:00 AM",
 *           "end_time": "04:00 PM",
 *           "start_dates": [
 *             "2021-04-26",
 *             "2021-04-28",
 *             "2021-04-30"
 *           ],
 *           "repeat": "every_other_week",
 *           "custom_dates": [
 *             {
 *               "date": "2021-04-29"
 *             }
 *           ]
 *         }
 *       }
 *       ```
 *
 *       ## open on mon, wed starting at 2021-05-03, 2021-05-05, every week, but not on 2021-05-10, and have an early end time on 2021-05-19
 *       ```
 *       {
 *         "operating_hours": {
 *           "start_time": "08:00 AM",
 *           "end_time": "04:00 PM",
 *           "start_dates": [
 *             "2021-05-03",
 *             "2021-05-05"
 *           ],
 *           "repeat": "every_week",
 *           "unavailable_dates": [
 *             "2021-05-10"
 *           ],
 *           "custom_dates": [
 *             {
 *               "date": "2021-05-19",
 *               "end_time": "01:00 PM"
 *             }
 *           ]
 *         }
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
 *               operating_hours:
 *                 type: object
 *                 properties:
 *                   start_time:
 *                     type: string
 *                   end_time:
 *                     type: string
 *                   start_dates:
 *                     type: array
 *                     items:
 *                       type: string
 *                   repeat:
 *                     type: string
 *                     enum: [none, every_day, every_other_day, every_week, every_other_week, every_month]
 *                   unavailable_dates:
 *                     type: array
 *                     items:
 *                       type: string
 *                   custom_dates:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         date:
 *                           type: string
 *                         start_time:
 *                           type: string
 *                         end_time:
 *                           type: string
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
 *                 data:
 *                   $ref: '#/components/schemas/Shop'
 */
const addShopOperatingHours = async (req: Request, res: Response) => {
  const { shopId } = req.params
  const data = req.body
  const operating_hours = data.operating_hours

  if (!shopId) return res.status(400).json({ status: 'error', message: 'id is required!' })

  // check if shop exists
  const shop = await ShopsService.getShopByID(shopId)
  if (!shop) return res.status(404).json({ status: 'error', message: 'Invalid Shop Id!' })

  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDocId
  if (!roles.editor && requestorDocId !== shop.user_id)
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to update a shop of another user.',
    })

  const updateData: any = {
    updated_by: requestorDocId || '',
    updated_from: data.source || '',
  }

  if (!_.isEmpty(operating_hours)) {
    const validation = validateOperatingHours(operating_hours)
    if (!validation.valid)
      return res.status(400).json({
        status: 'error',
        ...validation,
      })

    const {
      start_time,
      end_time,
      start_dates,
      repeat,
      unavailable_dates,
      custom_dates,
    } = operating_hours

    updateData.operating_hours = {
      start_time,
      end_time,
      start_dates,
      repeat,
      schedule: generateSchedule({
        start_time,
        end_time,
        start_dates,
        repeat,
        unavailable_dates,
        custom_dates,
      }),
    }
  }

  const result = await ShopsService.updateShop(shopId, updateData)

  return res.json({ status: 'ok', data: result })
}

export default addShopOperatingHours

import { Request, Response } from 'express'
import { ShopsService } from '../../../service'

/**
 * @openapi
 * /v1/shops/{shopId}/operatingHours:
 *   get:
 *     tags:
 *       - shops
 *     security:
 *       - bearerAuth: []
 *     description: Return shop operating_hours
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         description: document id of the shop
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: operating_hours of the shop
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
const getShopOperatingHours = async (req: Request, res: Response) => {
  const { shopId } = req.params

  // check if shop exists
  const shop = await ShopsService.getShopByID(shopId)
  if (!shop) return res.status(404).json({ status: 'error', message: 'Product does not exist!' })

  let operating_hours = shop.operating_hours

  let output: any = {}
  if (operating_hours) {
    const { start_time, end_time, repeat_type, repeat_unit, start_dates, schedule } =
      operating_hours
    output.start_time = start_time
    output.end_time = end_time
    output.repeat_type = repeat_type
    output.repeat_unit = repeat_unit
    output.start_dates = start_dates

    if (schedule && schedule.custom) {
      output.schedule = schedule
      const unavailable_dates = []
      const custom_dates = []
      Object.entries(schedule.custom).forEach(([key, val]) => {
        if (val.unavailable) unavailable_dates.push(key)
        if (val.start_time || val.end_time)
          custom_dates.push({ date: key, start_time: val.start_time, end_time: val.end_time })
      })
      if (unavailable_dates.length) output.unavailable_dates = unavailable_dates
      if (custom_dates.length) output.custom_dates = custom_dates
    }
  }

  return res.status(200).json({ status: 'ok', data: output })
}

export default getShopOperatingHours

import { Request, Response } from 'express'
import { ProductsService, ShopsService } from '../../../service'

/**
 * @openapi
 * /v1/products/{productId}/availability:
 *   get:
 *     tags:
 *       - products
 *     security:
 *       - bearerAuth: []
 *     description: Return the product availability. If does not exist, return shop operating_hours
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: document id of the product
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: availability of the product or the operating_hours of the shop
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 */
const getProductAvailability = async (req: Request, res: Response) => {
  const { productId } = req.params

  // check if product exists
  const product = await ProductsService.getProductByID(productId)
  if (!product) return res.status(404).json({ status: 'error', message: 'Product does not exist!' })

  let availability = product.availability
  if (!availability) {
    const shop = await ShopsService.getShopByID(product.shop_id)
    availability = shop.operating_hours
  }

  let output: any = {}
  if (availability) {
    const { start_time, end_time, repeat_type, repeat_unit, start_dates, schedule } = availability
    output.start_time = start_time
    output.end_time = end_time
    output.repeat_type = repeat_type
    output.repeat_unit = repeat_unit
    output.start_dates = start_dates

    if (schedule && schedule.custom) {
      output.schedule = schedule
      const unavailable_dates = []
      const custom_dates = []
      Object.entries(schedule.custom).forEach(([key, val]: any) => {
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

export default getProductAvailability

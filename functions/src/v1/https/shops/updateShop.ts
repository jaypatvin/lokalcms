import { Request, Response } from 'express'
import { ShopsService } from '../../../service'
import { validateValue } from '../../../utils/validateFields'
import { generateShopKeywords } from '../../../utils/generateKeywords'
import { hourFormat, timeFormatError } from './index'

/**
 * @openapi
 * /v1/shops/{shopId}:
 *   put:
 *     tags:
 *       - shops
 *     security:
 *       - bearerAuth: []
 *     description: Update shop
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               is_close:
 *                 type: boolean
 *               status:
 *                 type: string
 *               opening:
 *                 type: string
 *               closing:
 *                 type: string
 *               use_custom_hours:
 *                 type: boolean
 *               custom_hours:
 *                 type: object
 *                 properties:
 *                   mon:
 *                     type: object
 *                     properties:
 *                       opening:
 *                         type: string
 *                       closing:
 *                         type: string
 *                   tue:
 *                     type: object
 *                     properties:
 *                       opening:
 *                         type: string
 *                       closing:
 *                         type: string
 *                   wed:
 *                     type: object
 *                     properties:
 *                       opening:
 *                         type: string
 *                       closing:
 *                         type: string
 *                   thu:
 *                     type: object
 *                     properties:
 *                       opening:
 *                         type: string
 *                       closing:
 *                         type: string
 *                   fri:
 *                     type: object
 *                     properties:
 *                       opening:
 *                         type: string
 *                       closing:
 *                         type: string
 *                   sat:
 *                     type: object
 *                     properties:
 *                       opening:
 *                         type: string
 *                       closing:
 *                         type: string
 *                   sun:
 *                     type: object
 *                     properties:
 *                       opening:
 *                         type: string
 *                       closing:
 *                         type: string
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
const updateShop = async (req: Request, res: Response) => {
  const { shopId } = req.params
  const data = req.body

  if (!shopId) return res.status(400).json({ status: 'error', message: 'id is required!' })

  const currentShop = await ShopsService.getShopByID(shopId)

  if (!currentShop)
    return res.status(400).json({ status: 'error', message: 'Shop does not exist!' })

  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDocId
  if (!roles.editor && requestorDocId !== currentShop.user_id)
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to update a shop of another user.',
    })

  const updateData: any = {
    updated_by: requestorDocId,
    updated_from: data.source || ''
  }
  if (data.name) {
    updateData.name = data.name
    updateData.keywords = generateShopKeywords({ name: data.name })
  }
  if (data.description) updateData.description = data.description
  if (validateValue(data.is_close)) updateData.is_close = data.is_close

  if (data.opening) {
    if (!hourFormat.test(data.opening))
      return res
        .status(400)
        .json({ status: 'error', message: timeFormatError('opening', data.opening) })
    updateData['operating_hours.opening'] = data.opening
  }
  if (data.closing) {
    if (!hourFormat.test(data.closing))
      return res
        .status(400)
        .json({ status: 'error', message: timeFormatError('closing', data.closing) })
    updateData['operating_hours.closing'] = data.closing
  }
  if (validateValue(data.use_custom_hours))
    updateData['operating_hours.custom'] = data.use_custom_hours
  if (data.status) updateData.status = data.status

  if (typeof data.custom_hours === 'object') {
    const custom_hours_errors = []
    for (let key in data.custom_hours) {
      if (['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].includes(key)) {
        const opening = data.custom_hours[key].opening
        const closing = data.custom_hours[key].closing
        if (opening && !hourFormat.test(opening))
          custom_hours_errors.push(timeFormatError(`${key}.opening`, opening))
        if (closing && !hourFormat.test(closing))
          custom_hours_errors.push(timeFormatError(`${key}.closing`, opening))
        if (custom_hours_errors.length === 0) {
          if (opening) updateData[`operating_hours.${key}.opening`] = opening
          if (closing) updateData[`operating_hours.${key}.closing`] = closing
        }
      }
    }
    if (custom_hours_errors.length)
      return res
        .status(400)
        .json({ status: 'error', message: 'Incorrect time format', custom_hours_errors })
  }

  if (!Object.keys(updateData).length)
    return res.status(400).json({ status: 'error', message: 'no field for shop is provided' })

  const result = await ShopsService.updateShop(shopId, updateData)

  return res.json({ status: 'ok', data: result })
}

export default updateShop

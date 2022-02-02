import { Request, Response } from 'express'
import { isBoolean } from 'lodash'
import { BankCodesService, ShopsService } from '../../../service'
import { validateValue, isValidPaymentOptions } from '../../../utils/validations'
import { generateShopKeywords } from '../../../utils/generators'
import { ShopUpdateData } from '../../../models/Shop'

/**
 * @openapi
 * /v1/shops/{shopId}:
 *   put:
 *     tags:
 *       - shops
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will update a shop
 *       # Examples
 *       ### updating the name and description
 *       ```
 *       {
 *         "name": "Angel's Burger 2",
 *         "description": "bigger patty but bigger bun"
 *       }
 *       ```
 *
 *       ### closing the shop
 *       ```
 *       {
 *         "is_close": true
 *       }
 *       ```
 *
 *       ### disabling the shop
 *       ```
 *       {
 *         "status": "enabled"
 *       }
 *       ```
 *
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
 *               delivery_options:
 *                 type: object
 *                 properties:
 *                   delivery:
 *                     type: boolean
 *                     required: true
 *                   pickup:
 *                     type: boolean
 *                     required: true
 *               payment_options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     bank_code:
 *                       type: string
 *                       enum: [bdo, bpi, gcash, paymaya]
 *                     account_name:
 *                       type: string
 *                     account_number:
 *                       type: number
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
const updateShop = async (req: Request, res: Response) => {
  const { shopId } = req.params
  const data = req.body
  const {
    name,
    description,
    is_close,
    source,
    profile_photo,
    cover_photo,
    payment_options,
    delivery_options,
  } = data

  if (!shopId) return res.status(400).json({ status: 'error', message: 'id is required!' })

  const currentShop = await ShopsService.getShopByID(shopId)

  if (!currentShop)
    return res.status(400).json({ status: 'error', message: 'Shop does not exist!' })

  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  if (!roles.editor && requestorDocId !== currentShop.user_id) {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to update a shop of another user.',
    })
  }

  if (payment_options && !(await isValidPaymentOptions(payment_options))) {
    return res.status(400).json({ status: 'error', message: 'invalid payment_options' })
  }

  const updateData: ShopUpdateData = {
    updated_by: requestorDocId || '',
    updated_from: source || '',
  }
  if (name) {
    updateData.name = name
    updateData.keywords = generateShopKeywords({ name })
  }
  if (description) updateData.description = description
  if (validateValue(is_close)) updateData.is_close = is_close
  if (profile_photo) updateData.profile_photo = profile_photo
  if (cover_photo) updateData.cover_photo = cover_photo
  if (payment_options) {
    for (const paymentOption of payment_options) {
      const bankCode = await BankCodesService.getBankCodeById(paymentOption.bank_code)
      paymentOption.type = bankCode.type
    }
    updateData.payment_options = payment_options
  }
  if (delivery_options) {
    if (!isBoolean(data.delivery_options.pickup) || !isBoolean(data.delivery_options.delivery)) {
      return res.status(400).json({
        status: 'error',
        message: "delivery_options must contain 'pickup' and 'delivery' boolean field",
      })
    }
    updateData.delivery_options = delivery_options
  }

  if (!Object.keys(updateData).length)
    return res.status(400).json({ status: 'error', message: 'no field for shop is provided' })

  const result = await ShopsService.updateShop(shopId, updateData)

  return res.json({ status: 'ok', data: result })
}

export default updateShop

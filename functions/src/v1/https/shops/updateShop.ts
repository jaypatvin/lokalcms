import { RequestHandler } from 'express'
import { isBoolean, isNil } from 'lodash'
import { BankCodesService, ShopsService } from '../../../service'
import { isValidPaymentOptions } from '../../../utils/validations'
import {
  ErrorCode,
  generateError,
  generateNotFoundError,
  generateShopKeywords,
} from '../../../utils/generators'
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
const updateShop: RequestHandler = async (req, res) => {
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

  const currentShop = await ShopsService.findById(shopId)
  if (!currentShop) {
    throw generateNotFoundError(ErrorCode.ShopApiError, 'Shop', shopId)
  }

  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  if (!roles.editor && requestorDocId !== currentShop.user_id) {
    throw generateError(ErrorCode.ShopApiError, {
      message: 'User does not have a permission to update a shop of another user',
    })
  }

  if (payment_options && !(await isValidPaymentOptions(payment_options))) {
    throw generateError(ErrorCode.ShopApiError, {
      message: 'invalid payment_options',
    })
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
  if (isBoolean(is_close)) updateData.is_close = is_close
  if (!isNil(profile_photo)) updateData.profile_photo = profile_photo
  if (!isNil(cover_photo)) updateData.cover_photo = cover_photo
  if (payment_options) {
    for (const paymentOption of payment_options) {
      const bankCode = await BankCodesService.findById(paymentOption.bank_code)
      if (bankCode) {
        paymentOption.type = bankCode.type
      }
    }
    updateData.payment_options = payment_options
  }
  if (delivery_options) {
    updateData.delivery_options = delivery_options
  }

  const result = await ShopsService.update(shopId, updateData)

  return res.json({ status: 'ok', data: result })
}

export default updateShop

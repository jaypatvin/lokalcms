import { Request, Response } from 'express'
import { BankCodesService, ShopsService } from '../../../service'
import validateFields from '../../../utils/validateFields'
import { generateShopKeywords } from '../../../utils/generateKeywords'
import { required_fields } from './index'
import validateOperatingHours from '../../../utils/validateOperatingHours'
import generateSchedule from '../../../utils/generateSchedule'
import isValidPaymentOptions from '../../../utils/isValidPaymentOptions'

/**
 * @openapi
 * /v1/shops:
 *   post:
 *     tags:
 *       - shops
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will create a new shop
 *       # Example
 *       ```
 *       {
 *         "name": "Secret Shop",
 *         "description": "Description of the secret shop",
 *         "user_id": "document_id_of_owner",
 *         "operating_hours": {
 *           "start_time": "08:00 AM",
 *           "end_time": "04:00 PM",
 *           "start_dates": [
 *             "2021-05-03",
 *             "2021-05-05"
 *           ],
 *           "repeat_unit": 1,
 *           "repeat_type": "week",
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
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *               description:
 *                 type: string
 *                 required: true
 *               user_id:
 *                 type: string
 *                 required: true
 *               is_close:
 *                 type: boolean
 *               status:
 *                 type: string
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
 *                   repeat_unit:
 *                     type: number
 *                   repeat_type:
 *                     type: string
 *                     description: This can also be like every first monday (1-mon), or third tuesday (3-tue) of the month
 *                     enum: [day, week, month, 1-mon, 2-wed, 3-tue, 2-fri, 4-sun, 5-thu, 1-sat]
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
 *         description: The new shop
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
const createShop = async (req: Request, res: Response) => {
  const data = req.body
  const {
    user_id,
    name,
    description,
    is_close,
    status,
    source,
    profile_photo,
    cover_photo,
    payment_options,
  } = data
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  const requestorCommunityId = res.locals.userDoc.community_id
  if (!roles.editor && requestorDocId !== user_id) {
    return res.status(400).json({
      status: 'error',
      message: 'You do not have a permission to create a shop for another user.',
    })
  }

  const error_fields = validateFields(data, required_fields)
  if (error_fields.length) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Required fields missing', error_fields })
  }

  if (payment_options && !(await isValidPaymentOptions(payment_options))) {
    return res.status(400).json({ status: 'error', message: 'invalid payment_options' })
  }

  const keywords = generateShopKeywords({ name })

  const shopData: any = {
    name,
    description,
    user_id,
    community_id: requestorCommunityId,
    is_close: is_close || false,
    status: status || 'enabled',
    keywords,
    archived: false,
    updated_by: requestorDocId || '',
    updated_from: source || '',
  }

  const operatingHoursValidation = validateOperatingHours(data.operating_hours)
  if (!operatingHoursValidation.valid) {
    return res.status(400).json({
      status: 'error',
      ...operatingHoursValidation,
    })
  }

  const {
    start_time,
    end_time,
    start_dates,
    repeat_unit,
    repeat_type,
    unavailable_dates,
    custom_dates,
  } = data.operating_hours

  shopData.operating_hours = {
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

  if (profile_photo) shopData.profile_photo = profile_photo
  if (cover_photo) shopData.cover_photo = cover_photo
  if (payment_options) {
    for (const paymentOption of payment_options) {
      const bankCode = await BankCodesService.getBankCodeById(paymentOption.bank_code)
      paymentOption.type = bankCode.type
    }
    shopData.payment_options = payment_options
  }

  const result = await ShopsService.createShop(shopData)

  return res.json({ status: 'ok', data: result })
}

export default createShop

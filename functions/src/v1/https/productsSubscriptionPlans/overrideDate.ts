import dayjs from 'dayjs'
import { Request, Response } from 'express'
import { isString } from 'lodash'
import { ProductSubscriptionPlansService } from '../../../service'
import { dateFormat } from '../../../utils/helpers'

/**
 * @openapi
 * /v1/productSubscriptionPlans/{id}/overrideDate:
 *   put:
 *     tags:
 *       - product subscription plans
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will create an override date to the original date.
 *       ### This is used when there is a conflict to the product's or shop's availability, and the user wants to select a new date manually.
 *       # Examples
 *       ## Product is not available on 2021-09-22 so the user selected another date close to the original
 *       ```
 *       {
 *         "original_date": "2021-09-22",
 *         "new_date": "2021-09-23"
 *       }
 *       ```
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: document id of the product subscription plan
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               original_date:
 *                 type: string
 *                 required: true
 *               new_date:
 *                 type: string
 *                 required: true
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
const overrideDate = async (req: Request, res: Response) => {
  const { id } = req.params
  const data = req.body
  const { new_date, original_date } = data
  let { id: requestorDocId } = res.locals.userDoc

  if (!isString(original_date) || !dateFormat.test(original_date)) {
    return res.status(400).json({
      status: 'error',
      message: `Original date ${original_date} is not a valid format. Please follow format "2021-12-31"`,
    })
  }
  if (!dayjs(original_date).isValid()) {
    return res
      .status(400)
      .json({ status: 'error', message: `Original date ${original_date} is not a valid date.` })
  }

  if (!isString(new_date) || !dateFormat.test(new_date)) {
    return res.status(400).json({
      status: 'error',
      message: `Original date ${new_date} is not a valid format. Please follow format "2021-12-31"`,
    })
  }
  if (!dayjs(new_date).isValid()) {
    return res
      .status(400)
      .json({ status: 'error', message: `Original date ${new_date} is not a valid date.` })
  }

  const subscriptionPlan = await ProductSubscriptionPlansService.getProductSubscriptionPlanById(id)

  if (!subscriptionPlan) {
    return res
      .status(400)
      .json({ status: 'error', message: `Product subscription plan with id ${id} does not exist!` })
  }
  if (subscriptionPlan.seller_id !== requestorDocId) {
    return res.status(403).json({
      status: 'error',
      message: `User with id ${requestorDocId} is not the seller`,
    })
  }

  const updateData = {
    [`plan.override_dates.${original_date}`]: new_date,
  }

  await ProductSubscriptionPlansService.updateProductSubscriptionPlan(id, updateData)

  return res.json({ status: 'ok' })
}

export default overrideDate

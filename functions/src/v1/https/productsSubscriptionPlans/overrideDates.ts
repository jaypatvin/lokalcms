import dayjs from 'dayjs'
import { Request, Response } from 'express'
import { isString } from 'lodash'
import { ProductSubscriptionPlansService } from '../../../service'
import { dateFormat } from '../../../utils/helpers'

/**
 * @openapi
 * /v1/productSubscriptionPlans/{planId}/overrideDates:
 *   put:
 *     tags:
 *       - product subscription plans
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will create override dates to the original dates.
 *       ### This is used when there is a conflict to the product's or shop's availability, and the user wants to select new dates manually.
 *       # Examples
 *       ## Product is not available on 2021-09-22 and 2021-09-25 so the user selected another date close to the original dates
 *       ```
 *       {
 *         "override_dates": [
 *           {
 *             "original_date": "2021-09-22",
 *             "new_date": "2021-09-23"
 *           },
 *           {
 *             "original_date": "2021-09-25",
 *             "new_date": "2021-09-27"
 *           }
 *         ]
 *       }
 *       ```
 *     parameters:
 *       - in: path
 *         name: planId
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
 *               override_dates:
 *                 type: array
 *                 required: true
 *                 items:
 *                   type: object
 *                   properties:
 *                     original_date:
 *                       type: string
 *                       required: true
 *                     new_date:
 *                       type: string
 *                       required: true
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
 */
const overrideDates = async (req: Request, res: Response) => {
  const { planId } = req.params
  const data = req.body
  const { override_dates } = data
  let { id: requestorDocId } = res.locals.userDoc

  const overrideDatesUpdates = {}
  for (const override of override_dates) {
    const { original_date, new_date } = override

    if (!dayjs(original_date).isValid()) {
      return res
        .status(400)
        .json({ status: 'error', message: `Original date ${original_date} is not a valid date.` })
    }

    if (!dayjs(new_date).isValid()) {
      return res
        .status(400)
        .json({ status: 'error', message: `Original date ${new_date} is not a valid date.` })
    }
    overrideDatesUpdates[`plan.override_dates.${original_date}`] = new_date
  }

  const subscriptionPlan = await ProductSubscriptionPlansService.getProductSubscriptionPlanById(
    planId
  )

  if (!subscriptionPlan) {
    return res
      .status(400)
      .json({
        status: 'error',
        message: `Product subscription plan with id ${planId} does not exist!`,
      })
  }
  if (subscriptionPlan.buyer_id !== requestorDocId) {
    return res.status(400).json({
      status: 'error',
      message: `User with id ${requestorDocId} is not the buyer`,
    })
  }

  const updateData = {
    ...overrideDatesUpdates,
  }

  await ProductSubscriptionPlansService.updateProductSubscriptionPlan(planId, updateData)

  return res.json({ status: 'ok' })
}

export default overrideDates

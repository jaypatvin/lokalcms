import dayjs from 'dayjs'
import { Request, Response } from 'express'
import { isString } from 'lodash'
import { ProductSubscriptionPlansService } from '../../../service'
import generateDatesFromSchedule from '../../../utils/generateDatesFromSchedule'
import { dateFormat } from '../../../utils/helpers'

/**
 * @openapi
 * /v1/productSubscriptionPlans/{planId}/getDates:
 *   get:
 *     tags:
 *       - product subscription plans
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ## Return the available dates based on the schedule and within the given date range
 *       ### Default start date is today, and default end date is today + 45 days
 *       # Examples
 *       ```
 *       /v1/productSubscriptionPlans/{planId}/getDates?start_date=2021-09-30&end_date=2021-10-25
 *       /v1/productSubscriptionPlans/{planId}/getDates?end_date=2021-10-25
 *       /v1/productSubscriptionPlans/{planId}/getDates?start_date=2021-09-30
 *       ```
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         description: document id of the product subscription plan
 *         schema:
 *           type: string
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *         description: Will default to the current date. Must be in format YYYY-MM-DD.
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *         description: Will default to the current date + 45 days. Must be in format YYYY-MM-DD
 *     responses:
 *       200:
 *         description: array of dates in YYYY-MM-DD format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 */
const getDates = async (req: Request, res: Response) => {
  const { planId } = req.params
  const { start_date, end_date }: any = req.query

  if (start_date) {
    if (!isString(start_date) || !dateFormat.test(start_date)) {
      return res.status(400).json({
        status: 'error',
        message: `Start date ${start_date} is not a valid format. Please follow format "YYYY-MM-DD"`,
      })
    }
    if (!dayjs(start_date).isValid()) {
      return res
        .status(400)
        .json({ status: 'error', message: `Start date ${start_date} is not a valid date.` })
    }
  }

  if (end_date) {
    if (!isString(end_date) || !dateFormat.test(end_date)) {
      return res.status(400).json({
        status: 'error',
        message: `End date ${end_date} is not a valid format. Please follow format "YYYY-MM-DD"`,
      })
    }
    if (!dayjs(end_date).isValid()) {
      return res
        .status(400)
        .json({ status: 'error', message: `End date ${end_date} is not a valid date.` })
    }
  }

  if (start_date && end_date) {
    if (end_date < start_date) {
      return res.status(400).json({
        status: 'error',
        message: `End date ${end_date} cannot be before the Start date ${start_date}`,
      })
    }
  }

  // check if product subscription plan exists
  const subscriptionPlan = await ProductSubscriptionPlansService.getProductSubscriptionPlanById(
    planId
  )
  if (!subscriptionPlan) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Product Subscription Plan does not exist!' })
  }

  const plan = subscriptionPlan.plan
  const output = generateDatesFromSchedule(plan, { start_date, end_date })

  return res.status(200).json({ status: 'ok', data: output })
}

export default getDates

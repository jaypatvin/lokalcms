import { RequestHandler } from 'express'
import { ProductsService, ProductSubscriptionPlansService, ShopsService } from '../../../service'
import {
  ErrorCode,
  generateDatesFromSchedule,
  generateError,
  generateNotFoundError,
} from '../../../utils/generators'

/**
 * @openapi
 * /v1/productSubscriptionPlans/{planId}/autoRescheduleConflicts:
 *   post:
 *     tags:
 *       - product subscription plans
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will auto reschedule conflicting subscription dates with the shop/product availability to the nearest available date
 *       ### This will resolve up to 45 days if there are any conflicts
 *
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         description: document id of the product subscription plan
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const autoRescheduleConflicts: RequestHandler = async (req, res) => {
  const { planId } = req.params
  let requestorDocId = res.locals.userDoc.id

  const subscriptionPlan = await ProductSubscriptionPlansService.findById(planId)
  if (!subscriptionPlan) {
    throw generateNotFoundError(
      ErrorCode.ProductSubscriptionPlanApiError,
      'Product Subscription Plan',
      planId
    )
  }

  if (subscriptionPlan.buyer_id !== requestorDocId) {
    throw generateError(ErrorCode.ProductSubscriptionPlanApiError, {
      message: `User with id ${requestorDocId} is not the buyer`,
    })
  }

  const shop = await ShopsService.findById(subscriptionPlan.shop_id)
  if (!shop) {
    throw generateNotFoundError(
      ErrorCode.ProductSubscriptionPlanApiError,
      'Shop',
      subscriptionPlan.shop_id
    )
  }

  const product = await ProductsService.findById(subscriptionPlan.product_id)
  if (!product) {
    throw generateNotFoundError(
      ErrorCode.ProductSubscriptionPlanApiError,
      'Product',
      subscriptionPlan.product_id
    )
  }

  const availability = product.availability || shop.operating_hours
  const plan = subscriptionPlan.plan

  // get available dates of product or shop for 45 days
  const productDates = generateDatesFromSchedule(availability)

  // get subscription dates for 45 days
  const subscriptionDates = generateDatesFromSchedule(plan)

  // collect subscription dates that are not on the available dates of product or shop
  const conflicts = subscriptionDates.filter((d) => !productDates.includes(d))

  const availableProductDates = productDates.filter((pd) => !subscriptionDates.includes(pd))

  // set conflict dates to the nearest available date
  let overrideDates
  if (
    conflicts.length &&
    availableProductDates.length &&
    availableProductDates.length > conflicts.length
  ) {
    const existingOverrideDates = subscriptionPlan.plan.override_dates ?? {}
    overrideDates = conflicts.reduce<{ [x: string]: string }>((acc, conflict) => {
      const datesTaken = [...Object.values(acc), ...Object.values(existingOverrideDates)]
      const availableDates = availableProductDates.filter((d) => !datesTaken.includes(d))
      const sortedNearestDates = availableDates.sort((a, b) => {
        const distA = Math.abs(new Date(conflict).getTime() - new Date(a).getTime())
        const distB = Math.abs(new Date(conflict).getTime() - new Date(b).getTime())
        return distA - distB
      })
      if (!existingOverrideDates[conflict]) {
        acc[`plan.override_dates.${conflict}`] = sortedNearestDates.length
          ? sortedNearestDates[0]
          : '--'
      }
      return acc
    }, {})
  }

  const updateData = {
    'plan.auto_reschedule': true,
    ...overrideDates,
  }

  await ProductSubscriptionPlansService.update(planId, updateData)

  return res.json({ status: 'ok' })
}

export default autoRescheduleConflicts

import { Request, Response } from 'express'
import { ProductsService, ProductSubscriptionPlansService, ShopsService } from '../../../service'
import generateDatesFromSchedule from '../../../utils/generateDatesFromSchedule'

/**
 * @openapi
 * /v1/productSubscriptionPlans/{id}/autoRescheduleConflicts:
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
 *         name: id
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
const autoRescheduleConflicts = async (req: Request, res: Response) => {
  const { id } = req.params
  let requestorDocId = res.locals.userDoc.id

  const subscriptionPlan = await ProductSubscriptionPlansService.getProductSubscriptionPlanById(id)

  if (!subscriptionPlan) {
    return res
      .status(400)
      .json({ status: 'error', message: `Product subscription plan with id ${id} does not exist!` })
  }

  if (subscriptionPlan.buyer_id !== requestorDocId) {
    return res.status(400).json({
      status: 'error',
      message: `User with id ${requestorDocId} is not the buyer`,
    })
  }

  const shop = await ShopsService.getShopByID(subscriptionPlan.shop_id)

  if (!shop) {
    return res.status(400).json({ status: 'error', message: `Shop with id ${id} does not exist!` })
  }

  const product = await ProductsService.getProductByID(subscriptionPlan.product_id)

  if (!product) {
    return res
      .status(400)
      .json({ status: 'error', message: `Product with id ${id} does not exist!` })
  }

  const availability = product.availability || shop.operating_hours
  const plan = subscriptionPlan.plan

  // get available dates of product or shop for 45 days
  const productDates = generateDatesFromSchedule(availability)

  // get subscription dates for 45 days
  const subscriptionDates = generateDatesFromSchedule(plan)

  // collect subscription dates that are not on the available dates of product or shop
  const conflicts = subscriptionDates.filter((d) => !productDates.includes(d))

  // set conflict dates to the nearest available date
  let overrideDates
  if (conflicts.length && productDates.length && productDates.length > conflicts.length) {
    const existingOverrideDates = subscriptionPlan.override_dates ?? {}
    overrideDates = conflicts.reduce((acc, conflict) => {
      const datesTaken = [...Object.values(acc), ...Object.values(existingOverrideDates)]
      const availableDates = productDates.filter((d) => !datesTaken.includes(d))
      const sortedNearestDates = availableDates.sort((a, b) => {
        const distA = Math.abs(new Date(conflict).getTime() - new Date(a).getTime())
        const distB = Math.abs(new Date(conflict).getTime() - new Date(b).getTime())
        return distA - distB
      })
      if (!existingOverrideDates[conflict]) {
        acc[`plan.override_dates.${conflict}`] = sortedNearestDates.length ? sortedNearestDates[0] : '--'
      }
      return acc
    }, {})
  }

  const updateData = {
    ...overrideDates,
  }

  await ProductSubscriptionPlansService.updateProductSubscriptionPlan(id, updateData)

  return res.json({ status: 'ok' })
}

export default autoRescheduleConflicts

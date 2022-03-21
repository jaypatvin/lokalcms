import { RequestHandler } from 'express'
import { ProductSubscriptionPlanUpdateData } from '../../../models/ProductSubscriptionPlan'
import { ProductSubscriptionPlansService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/productSubscriptionPlans/{planId}/unsubscribe:
 *   put:
 *     tags:
 *       - product subscription plans
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ## This will unsubscribe the product subscription plan
 *       ### There will be no subscriptions and orders generated while the plan is unsubscribed.
 *
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         description: document id of the product subscription plan
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated product subscription plan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const unsubscribeProductSubscriptionPlan: RequestHandler = async (req, res) => {
  const data = req.body
  const { planId } = req.params
  let requestorDocId = res.locals.userDoc.id

  const plan = await ProductSubscriptionPlansService.getProductSubscriptionPlanById(planId)
  if (!plan) {
    throw generateNotFoundError(
      ErrorCode.ProductSubscriptionPlanApiError,
      'Product Subscription Plan',
      planId
    )
  }

  if (plan.buyer_id !== requestorDocId) {
    throw generateError(ErrorCode.ProductSubscriptionPlanApiError, {
      message: `User with id ${requestorDocId} is not the buyer`,
    })
  }

  const updateData = {
    updated_by: requestorDocId || '',
    updated_from: data.source || '',
    status: 'unsubscribed' as ProductSubscriptionPlanUpdateData['status'],
  }

  const result = await ProductSubscriptionPlansService.updateProductSubscriptionPlan(
    planId,
    updateData
  )

  return res.json({ status: 'ok', data: result })
}

export default unsubscribeProductSubscriptionPlan

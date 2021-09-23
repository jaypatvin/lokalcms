import { Request, Response } from 'express'
import { ProductsService, ProductSubscriptionPlansService, ShopsService } from '../../../service'

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
const confirm = async (req: Request, res: Response) => {
  const { id } = req.params
  let requestorDocId = res.locals.userDoc.id

  const subscriptionPlan = await ProductSubscriptionPlansService.getProductSubscriptionPlanById(id)

  if (!subscriptionPlan) {
    return res
      .status(400)
      .json({ status: 'error', message: `Product subscription plan with id ${id} does not exist!` })
  }

  if (subscriptionPlan.buyer_id !== requestorDocId)
    return res.status(400).json({
      status: 'error',
      message: `User with id ${requestorDocId} is not the buyer`,
    })

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

  // generate available dates of product or shop for 45 days

  // generate subscription dates for 45 days

  // collect subscription dates that are not on the available dates of product or shop

  // create override dates for collected dates

  return res.json({ status: 'ok' })
}

export default confirm

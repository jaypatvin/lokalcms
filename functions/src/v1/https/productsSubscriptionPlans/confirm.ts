import { Request, Response } from 'express'
import generateProductSubscriptions from '../../../scheduled/generateProductSubscriptions'
import { ProductSubscriptionPlansService } from '../../../service'

/**
 * @openapi
 * /v1/productSubscriptionPlans/{id}/confirm:
 *   put:
 *     tags:
 *       - product subscription plans
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will update the status of the subscription plan to "enabled"
 *       ## Note: the _seller_id_ will be extracted from the firestore token.
 *       ## For testing purposes, you can use the shop's owner doc id as the _seller_id_. But this will only work if the token is from an admin user.
 *       # Examples
 *       ## Seller with doc id _user-id-1_ confirming the subscription plan _subscription-plan-id-1_. The _id_ from the url should be _subscription-plan-id-1_
 *       ```
 *       {
 *         "seller_id": "user-id-1"
 *       }
 *       ```
 *
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
 *               seller_id:
 *                 type: string
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
const confirm = async (req: Request, res: Response) => {
  const data = req.body
  const { seller_id } = data
  const { id } = req.params
  const roles = res.locals.userRoles
  let requestorDocId = res.locals.userDoc.id

  const plan = await ProductSubscriptionPlansService.getProductSubscriptionPlanById(id)

  if (!plan) {
    return res
      .status(403)
      .json({ status: 'error', message: `Product subscription plan with id ${id} does not exist!` })
  }

  if (seller_id && roles.admin) {
    requestorDocId = seller_id
  }

  if (!roles.admin && plan.seller_id !== requestorDocId)
    return res.status(403).json({
      status: 'error',
      message: `User with id ${requestorDocId} is not the seller`,
    })

  const updateData = {
    updated_by: requestorDocId || '',
    updated_from: data.source || '',
    status: 'enabled',
  }

  const result = await ProductSubscriptionPlansService.updateProductSubscriptionPlan(id, updateData)
  await generateProductSubscriptions(id)

  return res.json({ status: 'ok', data: result })
}

export default confirm

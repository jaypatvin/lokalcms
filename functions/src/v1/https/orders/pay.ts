import { Request, Response } from 'express'
import { OrdersService } from '../../../service'

/**
 * @openapi
 * /v1/orders/{orderId}/pay:
 *   put:
 *     tags:
 *       - orders
 *     security:
 *       - bearerAuth: []
 *     description: Process the pay
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: document id of the order
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
 *         description: Updated order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 */
const pay = async (req: Request, res: Response) => {
  const data = req.body

  return res.json({ status: 'ok' })
}

export default pay

import { Request, Response } from 'express'

/**
 * @openapi
 * /v1/shops/{shopId}:
 *   delete:
 *     tags:
 *       - shops
 *     security:
 *       - bearerAuth: []
 *     description: Archive the shop
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         description: document id of the shop
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archived shop
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
const deleteShop = async (req: Request, res: Response) => {
  const roles = res.locals.userRoles
  if (!roles.admin) {
    return res
      .status(403)
      .json({
        status: 'error',
        message: 'The requestor does not have a permission to delete.',
      })
  }
  return res.json({ status: 'ok' })
}

export default deleteShop

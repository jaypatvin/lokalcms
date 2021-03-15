import { Request, Response } from 'express'
import { UsersService, ShopsService, ProductsService } from '../../../service'

/**
 * @openapi
 * /v1/users/{userId}:
 *   delete:
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     description: Archive the user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: document id of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archived user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/User'
 */
const archiveUser = async (req: Request, res: Response) => {
  const roles = res.locals.userRoles
  if (!roles.admin) {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to delete.',
    })
  }
  const { userId } = req.params
  if (!userId) return res.status(400).json({ status: 'error', message: 'User ID is required!' })

  // archive the user
  const result = await UsersService.archiveUser(userId)

  // archive the shops of the user
  await ShopsService.archiveUserShops(userId)

  // archive the products of the user
  await ProductsService.archiveUserProducts(userId)

  return res.json({
    status: 'ok',
    data: result,
    message: `User ${userId} successfully archived.`,
  })
}

export default archiveUser

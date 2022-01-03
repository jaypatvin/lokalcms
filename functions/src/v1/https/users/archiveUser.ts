import { Request, Response } from 'express'
import { UserUpdateData } from '../../../models/User'
import { UsersService, ShopsService, ProductsService } from '../../../service'

/**
 * @openapi
 * /v1/users/{userId}:
 *   delete:
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     description: Archive the user. Only editors and admins have permission to archive a user.
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
 */
const archiveUser = async (req: Request, res: Response) => {
  const data = req.body
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  if (!roles.admin) {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to delete.',
    })
  }
  const { userId } = req.params
  if (!userId) return res.status(400).json({ status: 'error', message: 'User ID is required!' })

  const requestData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  // archive the user
  const result = await UsersService.archiveUser(userId, requestData)

  // archive the shops of the user
  await ShopsService.archiveUserShops(userId, requestData)

  // archive the products of the user
  await ProductsService.archiveUserProducts(userId, requestData)

  return res.json({
    status: 'ok',
    data: result,
    message: `User ${userId} successfully archived.`,
  })
}

export default archiveUser

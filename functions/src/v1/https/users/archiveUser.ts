import { RequestHandler } from 'express'
import { UsersService, ShopsService, ProductsService } from '../../../service'
import generateError, { ErrorCode } from '../../../utils/generateError'

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
const archiveUser: RequestHandler = async (req, res, next) => {
  const data = req.body
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  if (!roles.admin) {
    return next(
      generateError(ErrorCode.UserApiError, {
        message: 'User does not have a permission to delete',
      })
    )
  }
  const { userId } = req.params

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
  })
}

export default archiveUser

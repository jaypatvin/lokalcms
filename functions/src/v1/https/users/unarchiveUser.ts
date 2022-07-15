import { RequestHandler } from 'express'
import { UsersService } from '../../../service'
import { ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/users/{userId}/unarchive:
 *   put:
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     description: Unarchive the user. Only admins and editors can unarchive a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: document id of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unarchived user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const unarchiveUser: RequestHandler = async (req, res) => {
  const data = req.body
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  if (!roles.admin) {
    throw generateError(ErrorCode.UserApiError, {
      message: 'User does not have a permission to unarchive',
    })
  }
  const { userId } = req.params

  const requestData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  const result = await UsersService.unarchive(userId, requestData)

  return res.json({
    status: 'ok',
    data: result,
  })
}

export default unarchiveUser

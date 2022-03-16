import { RequestHandler } from 'express'
import { UsersService } from '../../../service'
import { ErrorCode, generateNotFoundError } from '../../../utils/generators/generateError'

/**
 * @openapi
 * /v1/users/{userId}:
 *   get:
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     description: Return the user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: document id of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Single user
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
const getUser: RequestHandler = async (req, res, next) => {
  const { userId } = req.params

  const result = await UsersService.getUserByID(userId)

  if (!result) {
    return next(generateNotFoundError(ErrorCode.UserApiError, 'User', userId))
  }

  // reduce return data
  delete result.keywords
  delete result.community

  return res.json({ status: 'ok', data: result })
}

export default getUser

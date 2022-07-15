import { RequestHandler } from 'express'
import { omit } from 'lodash'
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
const getUser: RequestHandler = async (req, res) => {
  const { userId } = req.params

  const result = await UsersService.findById(userId)

  if (!result) {
    throw generateNotFoundError(ErrorCode.UserApiError, 'User', userId)
  }

  return res.json({ status: 'ok', data: omit(result, ['keywords', 'community']) })
}

export default getUser

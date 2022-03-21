import { RequestHandler } from 'express'
import { UsersService, CommentsService } from '../../../service'
import { generateNotFoundError, ErrorCode } from '../../../utils/generators'

/**
 * @openapi
 * /v1/users/{userId}/comments:
 *   get:
 *     tags:
 *       - activity comments
 *     security:
 *       - bearerAuth: []
 *     description: Returns user comments
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: Document id of user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The comments made by user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/Activities/Comments'
 */
const getUserComments: RequestHandler = async (req, res) => {
  const { userId } = req.params

  const user = await UsersService.getUserByID(userId)
  if (!user) {
    throw generateNotFoundError(ErrorCode.CommentApiError, 'User', userId)
  }

  const comments = await CommentsService.getUserComments(userId)

  return res.status(200).json({ status: 'ok', data: comments })
}

export default getUserComments

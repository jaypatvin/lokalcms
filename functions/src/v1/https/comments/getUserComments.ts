import { Request, Response } from 'express'
import { UsersService, CommentsService } from '../../../service'

/**
 * @openapi
 * /v1/users/{userId}/comments:
 *   get:
 *     tags:
 *       - comments
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
const getUserComments = async (req: Request, res: Response) => {
  const { userId } = req.params

  const user = await UsersService.getUserByID(userId)
  if (!user) return res.status(400).json({ status: 'error', message: 'Invalid Activity ID!' })

  const comments = await CommentsService.getUserComments(userId)

  return res.status(200).json({ status: 'ok', data: comments })
}

export default getUserComments

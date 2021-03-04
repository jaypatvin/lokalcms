import { Request, Response } from 'express'
import { UsersService } from '../../../service'

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
const getUser = async (req: Request, res: Response) => {
  const { userId } = req.params

  if (!userId) return res.status(400).json({ status: 'error', message: 'userId is required!' })

  const result = await UsersService.getUserByID(userId)

  if (!result) return res.status(200).json({ status: 'ok', data: null, message: 'User does not exist!' })

  // reduce return data
  delete result.keywords
  delete result.community

  return res.json({ status: 'ok', data: result })
}

export default getUser

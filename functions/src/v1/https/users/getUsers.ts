import { Request, Response } from 'express'
import { UsersService } from '../../../service'

/**
 * @openapi
 * /v1/users:
 *   get:
 *     description: Returns all users
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
const getUsers = async (req: Request, res: Response) => {
  const result = await UsersService.getUsers()

  if (!result.length) return res.status(204).json({ status: 'ok', data: result, message: 'No users' })

  result.forEach(user => {
    delete user.keywords
    delete user.community
  })

  return res.json({ status: 'ok', data: result })
}

export default getUsers

import { Request, Response } from 'express'
import { UsersService } from '../../../service'

/**
 * @openapi
 * /v1/users/{userId}/unarchive:
 *   put:
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     description: Unarchive the user
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
 *                 data:
 *                   $ref: '#/components/schemas/User'
 */
const unarchiveUser = async (req: Request, res: Response) => {
  const data = req.body
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  if (!roles.admin) {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to unarchive.',
    })
  }
  const { userId } = req.params
  if (!userId) return res.status(400).json({ status: 'error', message: 'User ID is required!' })

  const requestData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  const result = await UsersService.unarchiveUser(userId, requestData)

  return res.json({
    status: 'ok',
    data: result,
    message: `User ${userId} successfully unarchived.`,
  })
}

export default unarchiveUser

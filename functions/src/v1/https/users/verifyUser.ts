import { Request, Response } from 'express'
import { User } from '../../../models'
import { UsersService } from '../../../service'

/**
 * @openapi
 * /v1/users/{userId}/verify:
 *   put:
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will verify an existing user. The user id to be verified will be acquired from url path
 *       # Example
 *       ```
 *       {
 *         "notes": "looks legit"
 *       }
 *       ```
 *
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: document id of the user
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const verifyUser = async (req: Request, res: Response) => {
  const { userId } = req.params
  const { notes = '', source } = req.body
  const requestorDocId = res.locals.userDoc.id
  const roles = res.locals.userRoles

  if (!userId || !requestorDocId) {
    return res.status(400).json({ status: 'error', message: 'userId is required!' })
  }

  if (!roles.admin) {
    return res.status(400).json({
      status: 'error',
      message: 'You do not have a permission to verify a user.',
    })
  }

  // check if user id is valid
  const existingUser = await UsersService.getUserByID(userId)
  if (!existingUser) return res.status(400).json({ status: 'error', message: 'Invalid User ID!' })

  const updateData = {
    updated_by: requestorDocId,
    updated_from: source || '',
    status: 'active' as User['status'],
    'registration.notes': notes,
    'registration.step': 2,
    'registration.verified': true,
  }

  const result = await UsersService.updateUser(userId, updateData)

  return res.json({ status: 'ok', data: result })
}

export default verifyUser

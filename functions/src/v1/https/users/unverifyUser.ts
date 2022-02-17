import { Request, Response } from 'express'
import { UsersService } from '../../../service'

/**
 * @openapi
 * /v1/users/{userId}/unverify:
 *   put:
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will unverify an existing user. The user id to be unverified will be acquired from url path
 *       # Example
 *       ```
 *       {
 *         "notes": "you dont look legit!"
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 required: true
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
const unverifyUser = async (req: Request, res: Response) => {
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
  const existing_user = await UsersService.getUserByID(userId)
  if (!existing_user) return res.status(400).json({ status: 'error', message: 'Invalid User ID!' })

  const updateData = {
    updated_by: requestorDocId,
    updated_from: source || '',
    'registration.notes': notes,
    'registration.step': 0,
    'registration.verified': false,
  }

  const result = await UsersService.updateUser(userId, updateData)

  return res.json({ status: 'ok', data: result })
}

export default unverifyUser

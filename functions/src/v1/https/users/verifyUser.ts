import { RequestHandler } from 'express'
import { User } from '../../../models'
import { UsersService } from '../../../service'
import { ErrorCode, generateError, generateNotFoundError } from '../../../utils/generators'

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
const verifyUser: RequestHandler = async (req, res) => {
  const { userId } = req.params
  const { notes = '', source } = req.body
  const requestorDocId = res.locals.userDoc.id
  const roles = res.locals.userRoles

  if (!roles.admin) {
    throw generateError(ErrorCode.UserApiError, {
      message: 'User does not have a permission to verify a user',
    })
  }

  // check if user id is valid
  const user = await UsersService.getUserByID(userId)
  if (!user) {
    throw generateNotFoundError(ErrorCode.UserApiError, 'User', userId)
  }

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

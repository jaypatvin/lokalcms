import { RequestHandler } from 'express'
import { UsersService } from '../../../service'
import { ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/users/{userId}/register:
 *   put:
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will register an existing user. The user id to be registered will be acquired from the firebase token
 *       # Example
 *       ```
 *       {
 *         "id_type": "philhealth",
 *         "id_photo": "https://www.pngitem.com/pimgs/m/30-307416_profile-icon-png-image-free-download-searchpng-employee.png"
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
 *               id_type:
 *                 type: string
 *               id_photo:
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
const registerUser: RequestHandler = async (req, res) => {
  const { userId } = req.params
  const { id_type, id_photo, source } = req.body
  const requestorDocId = res.locals.userDoc.id

  if (requestorDocId !== userId) {
    throw generateError(ErrorCode.UserApiError, {
      message: 'userId does not match from the requestor',
    })
  }

  const updateData = {
    updated_by: requestorDocId,
    updated_from: source || '',
    'registration.id_type': id_type,
    'registration.id_photo': id_photo,
    'registration.step': 1,
  }

  const result = await UsersService.updateUser(userId, updateData)

  return res.json({ status: 'ok', data: result })
}

export default registerUser

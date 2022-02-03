import { Request, Response } from 'express'
import { UsersService } from '../../../service'

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
const registerUser = async (req: Request, res: Response) => {
  const { userId } = req.params
  const { id_type, id_photo, source } = req.body
  const requestorDocId = res.locals.userDoc.id

  if (!userId) return res.status(400).json({ status: 'error', message: 'id is required!' })
  if (!id_type || !id_photo) {
    return res.status(400).json({ status: 'error', message: 'id_type and id_photo is required!' })
  }

  // check if user id is valid
  const _existing_user = await UsersService.getUserByID(userId)
  if (!_existing_user) return res.status(400).json({ status: 'error', message: 'Invalid User ID!' })

  const updateData = {
    updated_by: requestorDocId,
    updated_from: source || '',
    'registration.id_type': id_type,
    'registration.id_photo': id_photo,
    'registration.step': 1,
  }

  const _result = await UsersService.updateUser(userId, updateData)

  return res.json({ status: 'ok', data: _result })
}

export default registerUser

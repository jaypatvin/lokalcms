import { RequestHandler } from 'express'
import { isNil } from 'lodash'
import { UsersService, CommunityService } from '../../../service'
import { generateUserKeywords } from '../../../utils/generators'
import { UserUpdateData } from '../../../models/User'
import db from '../../../utils/db'
import { ErrorCode, generateError, generateNotFoundError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/users/{userId}:
 *   put:
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will update an existing user
 *       # Examples
 *       ```
 *       {
 *         "first_name": "Xander",
 *         "last_name": "Ford",
 *         "profile_photo": "https://www.pngitem.com/pimgs/m/30-307416_profile-icon-png-image-free-download-searchpng-employee.png"
 *       }
 *       ```
 *
 *       ```
 *       {
 *         "street": "Equallity Street"
 *       }
 *
 *       ```
 *       {
 *         "display_name": "Luffytaro"
 *       }
 *
 *       ```
 *       {
 *         "is_admin": false
 *       }
 *       ```
 *
 *       ```
 *       {
 *         "status": "disabled"
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
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               street:
 *                 type: string
 *               community_id:
 *                 type: string
 *               display_name:
 *                 type: string
 *               is_admin:
 *                 type: boolean
 *               status:
 *                 type: string
 *               profile_photo:
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
const updateUser: RequestHandler = async (req, res) => {
  const { userId } = req.params
  const data = req.body
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  if (!roles.editor && requestorDocId !== userId) {
    throw generateError(ErrorCode.UserApiError, {
      message: 'User does not have a permission to updated another user',
    })
  }
  if (!roles.admin && data.hasOwnProperty('is_admin')) {
    throw generateError(ErrorCode.UserApiError, {
      message: 'User does not have a permission to set the admin value of any user',
    })
  }

  let newCommunity

  if (!userId) return res.status(400).json({ status: 'error', message: 'id is required!' })

  // check if user id is valid
  const existingUser = await UsersService.getUserByID(userId)
  if (!existingUser) {
    throw generateNotFoundError(ErrorCode.UserApiError, 'User', userId)
  }

  // check if community id is valid
  if (data.community_id) {
    newCommunity = await CommunityService.getCommunityByID(data.community_id)
    if (!newCommunity) {
      throw generateNotFoundError(ErrorCode.UserApiError, 'Community', data.community_id)
    }
  }

  let keywords

  if (data.first_name || data.last_name || data.display_name) {
    const first_name = data.first_name || existingUser.first_name
    const last_name = data.last_name || existingUser.last_name
    const display_name = data.display_name || existingUser.display_name
    keywords = generateUserKeywords({
      first_name,
      last_name,
      email: existingUser.email,
      display_name,
    })
  }

  const updateData: UserUpdateData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  if (data.first_name) updateData.first_name = data.first_name
  if (data.last_name) updateData.last_name = data.last_name
  if (data.display_name) updateData.display_name = data.display_name
  if (data.hasOwnProperty('is_admin')) updateData['roles.admin'] = data.is_admin
  if (data.status) updateData.status = data.status
  if (keywords) updateData.keywords = keywords
  if (!isNil(data.profile_photo)) updateData.profile_photo = data.profile_photo

  if (data.community_id && newCommunity) {
    // TODO: if user is admin of previous community, remove the user from admin array of community
    updateData.community_id = data.community_id
    updateData.community = db.community.doc(data.community_id)
    updateData['address.barangay'] = newCommunity.address.barangay
    updateData['address.city'] = newCommunity.address.city
    updateData['address.state'] = newCommunity.address.state
    updateData['address.subdivision'] = newCommunity.address.subdivision
    updateData['address.zip_code'] = newCommunity.address.zip_code
    updateData['address.country'] = newCommunity.address.country
  }

  if (data.street) updateData['address.street'] = data.street

  const result = await UsersService.updateUser(userId, updateData)

  return res.json({ status: 'ok', data: result })
}

export default updateUser

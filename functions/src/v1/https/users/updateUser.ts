import { Request, Response } from 'express'
import { UsersService, ShopsService, CommunityService } from '../../../service'
import { generateUserKeywords } from '../../../utils/generateKeywords'
import { validateValue } from '../../../utils/validateFields'
import { required_fields } from './index'
import { db } from '../index'

/**
 * @openapi
 * /v1/users/{userId}:
 *   put:
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     description: Update user
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
 *               email:
 *                 type: string
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
 *                 data:
 *                   $ref: '#/components/schemas/User'
 */
const updateUser = async (req: Request, res: Response) => {
  const { userId } = req.params
  const data = req.body
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDocId
  if (!roles.editor && requestorDocId !== userId)
    return res
      .status(403)
      .json({
        status: 'error',
        message: 'The requestor does not have a permission to update another user',
      })
  if (!roles.admin && data.is_admin) {
    return res
      .status(403)
      .json({
        status: 'error',
        message: 'The requestor does not have a permission to make a user an admin',
      })
  }

  let _community

  if (!userId) return res.status(400).json({ status: 'error', message: 'id is required!' })

  // check if user id is valid
  const _existing_user = await UsersService.getUserByID(userId)
  if (!_existing_user) return res.status(400).json({ status: 'error', message: 'Invalid User ID!' })

  if (data.unarchive_only) {
    if (_existing_user.status !== 'archived')
      return res.json({ status: 'error', message: 'User is not archived' })
    const _result = await UsersService.updateUser(userId, { status: 'active' })
    const shops_update = await ShopsService.setShopsStatusOfUser(userId, 'previous')

    return res.json({ status: 'ok', data: _result, shops_update })
  }

  const error_fields: string[] = []
  required_fields.forEach((field) => {
    if (data.hasOwnProperty(field) && !validateValue(data[field])) {
      error_fields.push(field)
    }
  })

  // check if community id is valid
  if (data.community_id) {
    try {
      _community = await CommunityService.getCommunityByID(data.community_id)
    } catch (e) {
      error_fields.push('community_id')
      return res
        .status(400)
        .json({ status: 'error', message: 'Invalid Community ID!', error_fields })
    }
  }

  if (error_fields.length) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Required fields missing!', error_fields })
  }

  let keywords

  if (data.first_name || data.last_name || data.display_name) {
    const first_name = data.first_name || _existing_user.first_name
    const last_name = data.last_name || _existing_user.last_name
    const display_name = data.display_name || _existing_user.display_name
    keywords = generateUserKeywords({
      first_name,
      last_name,
      email: _existing_user.email,
      display_name,
    })
  }

  const updateData: any = {}

  if (data.first_name) updateData.first_name = data.first_name
  if (data.last_name) updateData.last_name = data.last_name
  if (data.display_name) updateData.display_name = data.display_name
  if (data.is_admin) updateData['roles.admin'] = data.is_admin
  if (data.status) updateData.status = data.status
  if (keywords) updateData.keywords = keywords
  if (data.profile_photo) updateData.profile_photo = data.profile_photo

  if (data.community_id && _community) {
    // TODO: if user is admin of previous community, remove the user from admin array of community
    updateData.community_id = data.community_id
    updateData.community = db.doc(`community/${data.community_id}`)
    updateData['address.barangay'] = _community.address.barangay
    updateData['address.city'] = _community.address.city
    updateData['address.state'] = _community.address.state
    updateData['address.subdivision'] = _community.address.subdivision
    updateData['address.zip_code'] = _community.address.zip_code
    updateData['address.country'] = _community.address.country
  }

  if (data.street) updateData['address.street'] = data.street

  if (!Object.keys(updateData).length)
    return res.status(400).json({ status: 'error', message: 'no field for user is provided' })

  const _result = await UsersService.updateUser(userId, updateData)

  return res.json({ status: 'ok', data: _result })
}

export default updateUser

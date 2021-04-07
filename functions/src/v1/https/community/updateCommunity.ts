import { Request, Response } from 'express'
import { generateCommunityKeywords } from '../../../utils/generateKeywords'
import { UsersService, CommunityService } from '../../../service'
import { validateValue } from '../../../utils/validateFields'
import { required_fields } from './index'

/**
 * @openapi
 * /v1/community/{communityId}:
 *   put:
 *     tags:
 *       - community
 *     security:
 *       - bearerAuth: []
 *     description: Update community
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         description: document id of the community
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *               barangay:
 *                 type: string
 *                 required: true
 *               city:
 *                 type: string
 *                 required: true
 *               state:
 *                 type: string
 *                 required: true
 *               subdivision:
 *                 type: string
 *                 required: true
 *               zip_code:
 *                 type: string
 *                 required: true
 *               country:
 *                 type: string
 *                 required: true
 *               profile_photo:
 *                 type: string
 *               cover_photo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated community
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/Community'
 */
export const updateCommunity = async (req: Request, res: Response) => {
  const { communityId } = req.params
  const data = req.body
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDocId
  if (!roles.editor)
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to update a community',
    })

  if (!communityId) return res.status(400).json({ status: 'error', message: 'id is required!' })

  const _existing_community = await CommunityService.getCommunityByID(communityId)
  if (!_existing_community)
    return res.status(400).json({ status: 'error', message: 'Invalid Community ID!' })

  let existing_communities

  if (data.name || data.subdivision || data.barangay || data.city || data.zip_code) {
    existing_communities = await CommunityService.getCommunitiesByNameAndAddress({
      name: data.name || _existing_community.name,
      subdivision: data.subdivision || _existing_community.address.subdivision,
      barangay: data.barangay || _existing_community.address.barangay,
      city: data.city || _existing_community.address.city,
      zip_code: data.zip_code || _existing_community.address.zip_code,
    })

    if (existing_communities.find((community) => community.id !== communityId)) {
      return res.status(400).json({
        status: 'error',
        message: `Community "${data.name}" already exists with the same address.`,
        data: existing_communities,
      })
    }
  }

  const error_fields = []
  required_fields.forEach((field) => {
    if (data.hasOwnProperty(field) && !validateValue(data[field])) {
      error_fields.push(field)
    }
  })

  if (error_fields.length) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Required fields missing', error_fields })
  }

  if (data.admin) {
    if (!Array.isArray(data.admin))
      return res
        .status(400)
        .json({ status: 'error', message: 'admin field must be an array of user ids' })
    const not_existing_users = []
    const different_community_users = []
    for (let i = 0; i < data.admin.length; i++) {
      const user_id = data.admin[i]
      const user = await UsersService.getUserByID(user_id)
      if (!user) not_existing_users.push(user_id)
      if (user && user.community_id !== communityId) different_community_users.push(user_id)
    }
    if (not_existing_users.length || different_community_users.length)
      return res.status(400).json({
        status: 'error',
        message: 'invalid user ids on admin',
        not_existing_users,
        different_community_users,
      })
  }

  const updateData: any = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  if (
    data.name ||
    data.subdivision ||
    data.city ||
    data.barangay ||
    data.state ||
    data.country ||
    data.zip_code
  ) {
    const keywords = generateCommunityKeywords({
      name: data.name || _existing_community.name,
      subdivision: data.subdivision || _existing_community.address.subdivision,
      city: data.city || _existing_community.address.city,
      barangay: data.barangay || _existing_community.address.barangay,
      state: data.state || _existing_community.address.state,
      country: data.country || _existing_community.address.country,
      zip_code: data.zip_code || _existing_community.address.zip_code,
    })
    updateData.keywords = keywords
  }

  if (data.name) updateData.name = data.name
  if (data.profile_photo) updateData.profile_photo = data.profile_photo
  if (data.cover_photo) updateData.cover_photo = data.cover_photo

  if (data.subdivision) updateData['address.subdivision'] = data.subdivision
  if (data.barangay) updateData['address.barangay'] = data.barangay
  if (data.city) updateData['address.city'] = data.city
  if (data.state) updateData['address.state'] = data.state
  if (data.country) updateData['address.country'] = data.country
  if (data.zip_code) updateData['address.zip_code'] = data.zip_code
  if (data.admin) updateData.admin = data.admin

  if (!Object.keys(updateData).length)
    return res.status(400).json({ status: 'error', message: 'no field for community is provided' })

  const result = await CommunityService.updateCommunity(communityId, updateData)

  return res.json({ status: 'ok', data: result })
}

export default updateCommunity

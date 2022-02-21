import { Request, Response } from 'express'
import { generateCommunityKeywords } from '../../../utils/generators'
import { UsersService, CommunityService } from '../../../service'
import { CommunityUpdateData } from '../../../models/Community'

/**
 * @openapi
 * /v1/community/{communityId}:
 *   put:
 *     tags:
 *       - community
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will update a community
 *       # Examples
 *       ```
 *       {
 *         "name": "New community name"
 *       }
 *       ```
 *
 *       ```
 *       {
 *         "profile_photo": "url_of_new_photo"
 *       }
 *       ```
 *
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
 *               barangay:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               subdivision:
 *                 type: string
 *               zip_code:
 *                 type: string
 *               country:
 *                 type: string
 *               profile_photo:
 *                 type: string
 *               cover_photo:
 *                 type: string
 *               admin:
 *                 type: array
 *                 items:
 *                   type: string
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
 */
export const updateCommunity = async (req: Request, res: Response) => {
  const { communityId } = req.params
  const data = req.body
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  if (!roles.editor) {
    return res.status(400).json({
      status: 'error',
      message: 'You do not have a permission to update a community',
    })
  }

  const existing_community = await CommunityService.getCommunityByID(communityId)
  if (!existing_community) {
    return res.status(400).json({ status: 'error', message: 'Invalid Community ID!' })
  }

  if (data.name || data.subdivision || data.barangay || data.city || data.zip_code) {
    const existing_communities = await CommunityService.getCommunitiesByNameAndAddress({
      name: data.name || existing_community.name,
      subdivision: data.subdivision || existing_community.address.subdivision,
      barangay: data.barangay || existing_community.address.barangay,
      city: data.city || existing_community.address.city,
      zip_code: data.zip_code || existing_community.address.zip_code,
    })

    if (existing_communities.find((community) => community.id !== communityId)) {
      return res.status(400).json({
        status: 'error',
        message: `Community "${data.name}" already exists with the same address.`,
        data: existing_communities,
      })
    }
  }

  if (data.admin) {
    const notExistingUsers = []
    const differentCommunityUsers = []
    for (let i = 0; i < data.admin.length; i++) {
      const user_id = data.admin[i]
      const user = await UsersService.getUserByID(user_id)
      if (!user) notExistingUsers.push(user_id)
      if (user && user.community_id !== communityId) differentCommunityUsers.push(user_id)
    }
    if (notExistingUsers.length || differentCommunityUsers.length)
      return res.status(400).json({
        status: 'error',
        message: 'invalid user ids on admin',
        not_existing_users: notExistingUsers,
        different_community_users: differentCommunityUsers,
      })
  }

  const updateData: CommunityUpdateData = {
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
      name: data.name || existing_community.name,
      subdivision: data.subdivision || existing_community.address.subdivision,
      city: data.city || existing_community.address.city,
      barangay: data.barangay || existing_community.address.barangay,
      state: data.state || existing_community.address.state,
      country: data.country || existing_community.address.country,
      zip_code: data.zip_code || existing_community.address.zip_code,
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

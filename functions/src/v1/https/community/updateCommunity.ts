import { Request, Response } from 'express'
import { generateCommunityKeywords } from '../../../utils/generateKeywords'
import { UsersService, CommunityService } from '../../../service'
import { validateValue } from '../../../utils/validateFields'
import { required_fields } from './index'

export const updateCommunity = async (req: Request, res: Response) => {
  const data = req.body

  if (!data.id) return res.status(400).json({ status: 'error', message: 'id is required!' })

  const _existing_community = await CommunityService.getCommunityByID(data.id)
  if (!_existing_community)
    return res.status(400).json({ status: 'error', message: 'Invalid Community ID!' })

  if (data.unarchive_only) {
    if (!_existing_community.archived)
      return res.status(400).json({ status: 'error', message: 'Community is not archived' })
    const _result = await CommunityService.unarchiveCommunity(data.id)

    return res.json({ status: 'ok', data: _result })
  }

  let existing_communities

  if (data.name || data.subdivision || data.barangay || data.city || data.zip_code) {
    existing_communities = await CommunityService.getCommunitiesByNameAndAddress({
      name: data.name || _existing_community.name,
      subdivision: data.subdivision || _existing_community.address.subdivision,
      barangay: data.barangay || _existing_community.address.barangay,
      city: data.city || _existing_community.address.city,
      zip_code: data.zip_code || _existing_community.address.zip_code,
    })

    if (existing_communities.find((community) => community.id !== data.id)) {
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
      if (user && user.community_id !== data.id) different_community_users.push(user_id)
    }
    if (not_existing_users.length || different_community_users.length)
      return res.status(400).json({
        status: 'error',
        message: 'invalid user ids on admin',
        not_existing_users,
        different_community_users,
      })
  }

  const updateData: any = {}

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

  const result = await CommunityService.updateCommunity(data.id, updateData)

  return res.json({ status: 'ok', data: result })
}

export default updateCommunity

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { generateCommunityKeywords } from '../../utils/generateKeywords'
import * as CommunityService from '../../service/community'
import validateFields, { validateValue } from '../../utils/validateFields'
import { getUserByID } from '../../service/users'
//admin.initializeApp()

const db = admin.firestore()
const auth = admin.auth()

const required_fields = ['name', 'subdivision', 'city', 'barangay', 'state', 'country', 'zip_code']

export const getCommunities = async (req, res) => {
  return res.json({ status: 'ok' })
}

export const createCommunity = async (req, res) => {
  const data = req.body
  const error_fields = validateFields(data, required_fields)

  if (error_fields.length) {
    return res.json({ status: 'error', message: 'Required fields missing', error_fields })
  }

  // check if community name already exist
  const existing_communities = await CommunityService.getCommunitiesByNameAndAddress({
    name: data.name,
    subdivision: data.subdivision,
    barangay: data.barangay,
    city: data.city,
    zip_code: data.zip_code,
  })

  if (existing_communities.length) {
    return res.json({
      status: 'error',
      message: `Community "${data.name}" already exists with the same address.`,
      data: existing_communities,
    })
  }

  const keywords = generateCommunityKeywords({
    name: data.name,
    subdivision: data.subdivision,
    city: data.city,
    barangay: data.barangay,
    state: data.state,
    country: data.country,
    zip_code: data.zip_code,
  })

  // create new community
  const _newData: any = {
    name: data.name,
    address: {
      barangay: data.barangay,
      city: data.city,
      state: data.state,
      subdivision: data.subdivision,
      zip_code: data.zip_code,
      country: data.country,
    },
    keywords,
    archived: false,
  }
  if (data.profile_photo) {
    _newData.profile_photo = data.profile_photo
  }
  if (data.cover_photo) {
    _newData.cover_photo = data.cover_photo
  }

  const new_community = await CommunityService.createCommunity(_newData)
  const result = await new_community.get().then((doc) => doc.data())
  result.id = new_community.id

  return res.json({ status: 'ok', data: result })
}

export const getCommunity = async (req, res) => {
  res.json({ status: 'ok' })
}

export const updateCommunity = async (req, res) => {
  const data = req.body

  if (!data.id) return res.json({ status: 'error', message: 'id is required!' })

  const _existing_community = await CommunityService.getCommunityByID(data.id)
  if (!_existing_community) return res.json({ status: 'error', message: 'Invalid Community ID!' })

  if (data.unarchive_only) {
    if (!_existing_community.archived)
      return res.json({ status: 'error', message: 'Community is not archived' })
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
      return res.json({
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
    return res.json({ status: 'error', message: 'Required fields missing', error_fields })
  }

  if (data.admin) {
    if (!Array.isArray(data.admin))
      return res.json({ status: 'error', message: 'admin field must be an array of user ids' })
    const not_existing_users = []
    const different_community_users = []
    for (let i = 0; i < data.admin.length; i++) {
      const user_id = data.admin[i]
      const user = await getUserByID(user_id)
      if (!user) not_existing_users.push(user_id)
      if (user && user.community_id !== data.id) different_community_users.push(user_id)
    }
    if (not_existing_users.length || different_community_users.length)
      return res.json({
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
    return res.json({ status: 'error', message: 'no field for community is provided' })

  const result = await CommunityService.updateCommunity(data.id, updateData)

  return res.json({ status: 'ok', data: result })
}

export const deleteCommunity = async (req, res) => {
  const data = req.body
  if (!data.id) res.json({ status: 'error', message: 'Community ID is required!' })
  const { id: community_id, name } = data

  let result: any = ''
  if (data.hard_delete) {
    result = await CommunityService.deleteCommunity(community_id)
  } else {
    result = await CommunityService.archiveCommunity(community_id)
  }

  res.json({
    status: 'ok',
    data: result,
    message: `Community ${name || community_id} successfully ${
      data.hard_delete ? 'deleted' : 'archived'
    }.`,
  })
}

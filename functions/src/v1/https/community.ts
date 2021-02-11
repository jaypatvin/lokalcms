import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { generateCommunityKeywords } from '../../utils/generateKeywords'
import * as CommunityService from '../../service/community'
//admin.initializeApp()

const db = admin.firestore()
const auth = admin.auth()

const invalid_values = [null, undefined, '']
const required_fields = ['name', 'subdivision', 'city', 'barangay', 'state', 'country', 'zip_code']


export const getCommunities = async (req, res) => {
 
  return res.json({status: 'ok'})
}

export const createCommunity = async (req, res) => {

  const data = req.body
  const error_fields = []

  // check required fields
  required_fields.forEach((field) => {
    if (invalid_values.includes(data[field])) error_fields.push(field)
  })

  if (error_fields.length) {
    return res.json({ status: 'error', message: 'Required fields missing', error_fields })
  }

  // check if community name already exist
  const existing_communities = await CommunityService.getCommunitiesByNameAndAddress({
    name: data.name,
    subdivision: data.subdivision,
    barangay: data.barangay,
    city: data.city,
    zip_code: data.zip_code
  })

  if (existing_communities.length) {
    return res.json({ status: 'error', message: `Community "${data.name}" already exists with the same address.`, data: existing_communities })
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

  res.json({status: 'ok'})
}


export const updateCommunity = async (req, res) => {
  const data = req.body
  const error_fields = []

  const existing_community = await CommunityService.getCommunityByID(data.id)

  const existing_communities = await CommunityService.getCommunitiesByNameAndAddress({
    name: data.name,
    subdivision: data.subdivision,
    barangay: data.barangay,
    city: data.city,
    zip_code: data.zip_code
  })

  if (existing_communities.find(community => community.id !== data.id)) {
    return res.json({ status: 'error', message: `Community "${data.name}" already exists with the same address.`, data: existing_communities })
  }

  // check required fields
  required_fields.forEach((field) => {
    if (invalid_values.includes(data[field])) error_fields.push(field)
  })

  if (error_fields.length) {
    return res.json({ status: 'error', message: 'Required fields missing', error_fields })
  }


  const updateData: any = { address: existing_community.address }

  if (
    existing_community.name !== data.name ||
    existing_community.address.subdivision !== data.subdivision ||
    existing_community.address.city !== data.city ||
    existing_community.address.barangay !== data.barangay ||
    existing_community.address.state !== data.state ||
    existing_community.address.country !== data.country ||
    existing_community.address.zip_code !== data.zip_code
  ) {
    const keywords = generateCommunityKeywords({
      name: data.name,
      subdivision: data.subdivision,
      city: data.city,
      barangay: data.barangay,
      state: data.state,
      country: data.country,
      zip_code: data.zip_code,
    })
    updateData.keywords = keywords
  }

  if (existing_community.name !== data.name) updateData.name = data.name
  if (existing_community.profile_photo !== data.profile_photo)
    updateData.profile_photo = data.profile_photo
  if (existing_community.cover_photo !== data.cover_photo)
    updateData.cover_photo = data.cover_photo

  if (existing_community.address.subdivision !== data.subdivision) updateData.address.subdivision = data.subdivision
  if (existing_community.address.barangay !== data.barangay) updateData.address.barangay = data.barangay
  if (existing_community.address.city !== data.city) updateData.address.city = data.city
  if (existing_community.address.state !== data.state) updateData.address.state = data.state
  if (existing_community.address.country !== data.country) updateData.address.country = data.country
  if (existing_community.address.zip_code !== data.zip_code) updateData.address.zip_code = data.zip_code


  const result = await CommunityService.updateCommunity(data.id, updateData)

  return res.json({ status: 'ok', data: result })
}


export const deleteCommunity = async (req, res) => {

  res.json({status: 'ok'})
}


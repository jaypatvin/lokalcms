import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

import { getUserByID } from '../../service/users'
import * as ShopService from '../../service/shops'
import { getCommunityByID } from '../../service/community'
import validateFields, { validateValue } from '../../utils/validateFields'
import { generateShopKeywords } from '../../utils/generateKeywords'

//admin.initializeApp()

const db = admin.firestore()
const auth = admin.auth()

const required_fields = ['name', 'description', 'user_id', 'opening', 'closing']
const hourFormat = /((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))/

const timeFormatError = (field: string, time: string) => {
  return `Incorrect time format for field "${field}": "${time}". Please follow format "12:00 PM"`
}

export const getShops = async (req, res) => {
  return res.json({ status: 'ok' })
}

export const createShop = async (req, res) => {
  const data = req.body
  let _user
  let _community

  // check if user id is valid
  try {
    _user = await getUserByID(data.user_id)
    if (_user.status === 'archived')
      return res.json({
        status: 'error',
        message: `User with id ${data.user_id} is currently archived!`,
      })
  } catch (e) {
    return res.json({ status: 'error', message: 'Invalid User ID!' })
  }

  // check if community id is valid
  try {
    _community = await getCommunityByID(_user.community_id)
    if (_community.archived)
      return res.json({
        status: 'error',
        message: `Community of user ${_user.email} is currently archived!`,
      })
  } catch (e) {
    return res.json({
      status: 'error',
      message: `Community of user ${_user.email} is does not exist!`,
    })
  }

  const error_fields = validateFields(data, required_fields)
  if (error_fields.length) {
    return res.json({ status: 'error', message: 'Required fields missing', error_fields })
  }

  // check if correct time format
  if (!hourFormat.test(data.opening))
    return res.json({
      status: 'error',
      message: timeFormatError('opening', data.opening),
    })
  if (!hourFormat.test(data.closing))
    return res.json({
      status: 'error',
      message: timeFormatError('closing', data.closing),
    })

  const keywords = generateShopKeywords({ name: data.name })

  const _newData: any = {
    name: data.name,
    description: data.description,
    user_id: data.user_id,
    community_id: _user.community_id,
    is_close: data.is_close || false,
    operating_hours: {
      opening: data.opening,
      closing: data.closing,
      custom: data.use_custom_hours || false,
    },
    status: data.status || 'enabled',
    keywords,
  }

  if (data.profile_photo) _newData.profile_photo = data.profile_photo
  if (data.cover_photo) _newData.cover_photo = data.cover_photo

  if (typeof data.custom_hours === 'object') {
    const custom_hours_errors = []
    for (let key in data.custom_hours) {
      if (['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].includes(key)) {
        const opening = data.custom_hours[key].opening
        const closing = data.custom_hours[key].closing
        if (!hourFormat.test(opening))
          custom_hours_errors.push(timeFormatError(`${key}.opening`, opening))
        if (!hourFormat.test(closing))
          custom_hours_errors.push(timeFormatError(`${key}.closing`, opening))
        if (custom_hours_errors.length === 0) _newData.operating_hours[key] = { opening, closing }
      }
    }
    if (custom_hours_errors.length)
      return res.json({ status: 'error', message: 'Incorrect time format', custom_hours_errors })
  }

  const _newShop = await ShopService.createShop(_newData)

  // get the created shop's data
  let _result = await _newShop.get().then((doc) => {
    return doc.data()
  })

  // add the shop document id
  _result.id = _newShop.id

  return res.json({ status: 'ok', data: _result })
}

export const getShop = async (req, res) => {
  res.json({ status: 'ok' })
}

export const updateShop = async (req, res) => {
  const data = req.body

  if (!data.id) return res.json({ status: 'error', message: 'id is required!' })

  const updateData: any = {}
  if (data.name) {
    updateData.name = data.name
    updateData.keywords = generateShopKeywords({ name: data.name })
  }
  if (data.description) updateData.description = data.description
  if (validateValue(data.is_close)) updateData.is_close = data.is_close

  if (data.opening) {
    if (!hourFormat.test(data.opening))
      return res.json({ status: 'error', message: timeFormatError('opening', data.opening) })
    updateData['operating_hours.opening'] = data.opening
  }
  if (data.closing) {
    if (!hourFormat.test(data.closing))
      return res.json({ status: 'error', message: timeFormatError('closing', data.closing) })
    updateData['operating_hours.closing'] = data.closing
  }
  if (validateValue(data.use_custom_hours))
    updateData['operating_hours.custom'] = data.use_custom_hours
  if (data.status) updateData.status = data.status

  if (typeof data.custom_hours === 'object') {
    const custom_hours_errors = []
    for (let key in data.custom_hours) {
      if (['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].includes(key)) {
        const opening = data.custom_hours[key].opening
        const closing = data.custom_hours[key].closing
        if (opening && !hourFormat.test(opening))
          custom_hours_errors.push(timeFormatError(`${key}.opening`, opening))
        if (closing && !hourFormat.test(closing))
          custom_hours_errors.push(timeFormatError(`${key}.closing`, opening))
        if (custom_hours_errors.length === 0) {
          if (opening) updateData[`operating_hours.${key}.opening`] = opening
          if (closing) updateData[`operating_hours.${key}.closing`] = closing
        }
      }
    }
    if (custom_hours_errors.length)
      return res.json({ status: 'error', message: 'Incorrect time format', custom_hours_errors })
  }

  if (!Object.keys(updateData).length)
    return res.json({ status: 'error', message: 'no field for shop is provided' })

  const result = await ShopService.updateShop(data.id, updateData)

  return res.json({ status: 'ok', data: result })
}

export const deleteShop = async (req, res) => {
  res.json({ status: 'ok' })
}

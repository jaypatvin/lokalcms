import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

import { getUserByID } from '../../service/users'
import * as ShopService from '../../service/shops'
import { getCommunityByID } from '../../service/community'
import validateFields from '../../utils/validateFields'

//admin.initializeApp()

const db = admin.firestore()
const auth = admin.auth()

const required_fields = ['name', 'description', 'user_id', 'opening', 'closing']
const hourFormat = /((1[0-2]|0?[1-9]):([0-5][0-9]) ([AaPp][Mm]))/

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
      message: `Incorrect format for opening time (${data.opening}). Please follow format [12:00 PM]`,
    })
  if (!hourFormat.test(data.closing))
    return res.json({
      status: 'error',
      message: `Incorrect format for closing time (${data.closing}). Please follow format [12:00 PM]`,
    })

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
          custom_hours_errors.push(
            `Incorrect format for opening time (${opening}) on day ${key}. Please follow format [12:00 PM]`
          )
        if (!hourFormat.test(closing))
          custom_hours_errors.push(
            `Incorrect format for closing time (${closing}) on day ${key}. Please follow format [12:00 PM]`
          )
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
  res.json({ status: 'ok' })
}

export const deleteShop = async (req, res) => {
  res.json({ status: 'ok' })
}

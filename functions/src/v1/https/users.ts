import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as UsersService from '../../service/users'
import * as ShopsService from '../../service/shops'
import { getCommunityByID } from '../../service/community'
import { generateUserKeywords } from '../../utils/generateKeywords'
import validateFields, { validateValue } from '../../utils/validateFields'

//admin.initializeApp()

const db = admin.firestore()
const auth = admin.auth()

const required_fields = ['email', 'first_name', 'last_name', 'street', 'community_id']

export const getUsers = async (req, res) => {
  // TODO: return list of users
  const _user = await db.collection('users').doc('aqSJ1egyCHhPx7d3uznWcxylpLi2').get()

  if (!_user.exists) {
    console.log('No document')
    res.json({ status: 'error', message: 'Not Found' })
  } else {
    res.json(_user.data())
  }
}

export const createUser = async (req, res) => {
  const data = req.body
  let _authUser
  let _community
  const error_fields = validateFields(data, required_fields)

  if (error_fields.length) {
    return res.json({ status: 'error', message: 'Required fields missing', error_fields })
  }

  // double check if uid is valid
  try {
    if (data.user_uid) {
      _authUser = await auth.getUser(data.user_uid)
    } else if (data.email) {
      _authUser = await auth.getUserByEmail(data.email)
    }
  } catch (e) {
    if (data.user_uid) return res.json({ status: 'error', message: 'Invalid User UID!' })
    error_fields.push('email')
    return res.json({ status: 'error', message: 'Email not found', error_fields })
  }

  // check if community id is valid
  try {
    _community = await getCommunityByID(data.community_id)
  } catch (e) {
    error_fields.push('community_id')
    return res.json({ status: 'error', message: 'Invalid Community ID!', error_fields })
  }

  // check if uid already exist in the users' collection
  const _users = await UsersService.getUserByUID(_authUser.uid)

  if (_users.length > 0) {
    return res.json({ status: 'error', message: 'User "' + _authUser.email + '" already exist!' })
  }

  const keywords = generateUserKeywords({
    first_name: data.first_name,
    last_name: data.last_name,
    email: _authUser.email,
    display_name: data.display_name || `${data.first_name} ${data.last_name}`
  })

  // create a user
  const _newData: any = {
    user_uids: [_authUser.uid],
    first_name: data.first_name,
    last_name: data.last_name,
    display_name: data.display_name || `${data.first_name} ${data.last_name}`,
    email: _authUser.email,
    roles: {
      admin: data.is_admin || false,
      member: true,
    },
    status: data.status || 'active',
    birthdate: '',
    registration: {
      id_photo: '',
      id_type: '',
      notes: '',
      step: 0,
      verified: false,
    },
    community_id: data.community_id,
    community: db.doc(`community/${data.community_id}`),
    address: {
      barangay: _community.address.barangay,
      street: data.street,
      city: _community.address.city,
      state: _community.address.state,
      subdivision: _community.address.subdivision,
      zip_code: _community.address.zip_code,
      country: _community.address.country,
    },
    keywords,
  }
  if (data.profile_photo) {
    _newData.profile_photo = data.profile_photo
  }

  const _newUser = await UsersService.createUser(_newData)

  // get the created user's data
  let _result = await _newUser.get().then((doc) => {
    return doc.data()
  })

  // add the user document id
  _result.id = _newUser.id

  return res.json({ status: 'ok', data: _result })
}

export const getUser = async (req, res) => {
  res.json({ status: 'ok' })
}

export const updateUser = async (req, res) => {
  const data = req.body
  let _community

  if (!data.id) return res.json({ status: 'error', message: 'id is required!' })

  const existingUserData = await UsersService.getUserByID(data.id)

  if (data.unarchive_only) {
    if (existingUserData.status !== 'archived') return res.json({ status: 'error', message: "User is not archived" })
    const _result = await UsersService.updateUser(data.id, { status: 'active' })
    const shops_update = await ShopsService.setShopsStatusOfUser(data.id, 'previous')

    return res.json({ status: 'ok', data: _result, shops_update })
  }

  const error_fields: string[] = []
  required_fields.forEach(field => {
    if (data.hasOwnProperty(field) && !validateValue(data[field])) {
      error_fields.push(field)
    }
  })

  // check if community id is valid
  if (data.community_id) {
    try {
      _community = await getCommunityByID(data.community_id)
    } catch (e) {
      error_fields.push('community_id')
      return res.json({ status: 'error', message: 'Invalid Community ID!', error_fields })
    }
  }

  if (error_fields.length) {
    return res.json({ status: 'error', message: 'Required fields missing!', error_fields })
  }

  let keywords

  if (data.first_name || data.last_name || data.display_name
  ) {
    const first_name = data.first_name || existingUserData.first_name
    const last_name = data.last_name || existingUserData.last_name
    const display_name = data.display_name || existingUserData.display_name 
    keywords = generateUserKeywords({
      first_name,
      last_name,
      email: existingUserData.email,
      display_name
    })
  }

  const updateData: any = { }

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
    return res.json({ status: 'error', message: 'no field for user is provided' })

  const _result = await UsersService.updateUser(data.id, updateData)

  return res.json({ status: 'ok', data: _result })
}

export const archiveUser = async (req, res) => {
  const data = req.body
  if (!data.id) res.json({ status: 'error', message: 'User ID is required!' })
  const { id: user_id, display_name } = data

  // archive the user
  const result = await UsersService.archiveUser(user_id)

  // archive the shops of the user
  const shops_update = await ShopsService.setShopsStatusOfUser(user_id, 'archived')

  res.json({ status: 'ok', data: result, shops_update, message: `User ${display_name || user_id} successfully deleted.` })
}

import { Request, Response } from 'express'
import { UsersService, CommunityService } from '../../../service'
import { generateUserKeywords } from '../../../utils/generateKeywords'
import validateFields from '../../../utils/validateFields'
import { required_fields } from './index'
import { db, auth } from '../index'

/**
 * @openapi
 * /v1/users:
 *   post:
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     description: Create new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 required: true
 *               first_name:
 *                 type: string
 *                 required: true
 *               last_name:
 *                 type: string
 *                 required: true
 *               street:
 *                 type: string
 *                 required: true
 *               community_id:
 *                 type: string
 *                 required: true
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
 *         description: The new user
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
const createUser = async (req: Request, res: Response) => {
  const data = req.body
  let _authUser
  let _community
  const error_fields = validateFields(data, required_fields)

  if (error_fields.length) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Required fields missing', error_fields })
  }

  // double check if uid is valid
  try {
    if (data.user_uid) {
      _authUser = await auth.getUser(data.user_uid)
    } else if (data.email) {
      _authUser = await auth.getUserByEmail(data.email)
    }
  } catch (e) {
    if (data.user_uid)
      return res.status(400).json({ status: 'error', message: 'Invalid User UID!' })
    error_fields.push('email')
    return res.status(400).json({ status: 'error', message: 'Email not found', error_fields })
  }

  // check if community id is valid
  try {
    _community = await CommunityService.getCommunityByID(data.community_id)
  } catch (e) {
    error_fields.push('community_id')
    return res.status(400).json({ status: 'error', message: 'Invalid Community ID!', error_fields })
  }

  // check if uid already exist in the users' collection
  const _users = await UsersService.getUserByUID(_authUser.uid)

  if (_users.length > 0) {
    return res
      .status(400)
      .json({ status: 'error', message: 'User "' + _authUser.email + '" already exist!' })
  }

  const keywords = generateUserKeywords({
    first_name: data.first_name,
    last_name: data.last_name,
    email: _authUser.email,
    display_name: data.display_name || `${data.first_name} ${data.last_name}`,
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

export default createUser

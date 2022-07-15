import { RequestHandler } from 'express'
import { getAuth } from 'firebase-admin/auth'
import { doc } from 'firebase/firestore'
import { UsersService, CommunityService } from '../../../service'
import { generateUserKeywords } from '../../../utils/generators'
import { UserCreateData } from '../../../models/User'
import db from '../../../utils/db'
import { ErrorCode, generateError, generateNotFoundError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/users:
 *   post:
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will create a new user
 *       # Examples
 *       ```
 *       {
 *         "email": "newuser123@google.com",
 *         "first_name": "John",
 *         "last_name": "Doe",
 *         "street": "phase 1 block 10 lot 20",
 *         "community_id": "id_of_thecommunity_to_join"
 *       }
 *       ```
 *
 *       ```
 *       {
 *         "email": "newuser123@google.com",
 *         "first_name": "John",
 *         "last_name": "Doe",
 *         "street": "phase 1 block 10 lot 20",
 *         "community_id": "id_of_thecommunity_to_join",
 *         "display_name": "Jonathan Davis",
 *         "is_admin": true,
 *         "profile_photo": "url_of_the_photo"
 *       }
 *       ```
 *
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
const createUser: RequestHandler = async (req, res) => {
  const data = req.body
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  // @ts-ignore
  const tokenUser = req.user

  let authUser

  try {
    authUser = await getAuth().getUserByEmail(data.email)
  } catch (e) {
    throw generateError(ErrorCode.UserApiError, {
      message: `Auth user with email "${data.email}" does not exist`,
    })
  }

  if (authUser.uid !== tokenUser.uid) {
    if (!roles.editor) {
      throw generateError(ErrorCode.UserApiError, {
        message: 'User does not have a permission to create another user',
      })
    }
    if (!roles.admin && data.is_admin) {
      throw generateError(ErrorCode.UserApiError, {
        message: 'User do not have a permission to create an admin user',
      })
    }
  }

  const community = await CommunityService.findById(data.community_id)
  if (!community) {
    throw generateNotFoundError(ErrorCode.UserApiError, 'Community', data.community_id)
  }

  const existingUser = await UsersService.findUserByUid(authUser.uid)

  if (existingUser) {
    throw generateError(ErrorCode.UserApiError, {
      message: `User with email "${authUser.email}" already exists`,
    })
  }

  const keywords = generateUserKeywords({
    first_name: data.first_name,
    last_name: data.last_name,
    email: authUser.email,
    display_name: data.display_name || `${data.first_name} ${data.last_name}`,
  })

  // create a user
  const newData: UserCreateData = {
    user_uids: [authUser.uid],
    first_name: data.first_name,
    last_name: data.last_name,
    display_name: data.display_name || `${data.first_name} ${data.last_name}`,
    email: authUser.email,
    roles: {
      admin: data.is_admin || false,
      member: true,
    },
    status: data.status || 'pending',
    birthdate: '',
    registration: {
      id_photo: '',
      id_type: '',
      notes: '',
      step: 0,
      verified: false,
    },
    community_id: data.community_id,
    community: doc(db.community, data.community_id),
    address: {
      barangay: community.address.barangay,
      street: data.street,
      city: community.address.city,
      state: community.address.state,
      subdivision: community.address.subdivision,
      zip_code: community.address.zip_code,
      country: community.address.country,
    },
    keywords,
    archived: false,
    updated_by: requestorDocId || '',
    updated_from: data.source || '',
  }
  if (data.profile_photo) {
    newData.profile_photo = data.profile_photo
  }

  const newUser = await UsersService.create(newData)

  return res.json({ status: 'ok', data: newUser })
}

export default createUser

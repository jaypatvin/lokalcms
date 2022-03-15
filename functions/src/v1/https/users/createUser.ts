import { RequestHandler } from 'express'
import { UsersService, CommunityService } from '../../../service'
import { generateUserKeywords } from '../../../utils/generators'
import { auth } from '../index'
import { UserCreateData } from '../../../models/User'
import db from '../../../utils/db'
import generateError, {
  ErrorCode,
  generateCommunityNotFoundError,
} from '../../../utils/generateError'

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
const createUser: RequestHandler = async (req, res, next) => {
  const data = req.body
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  const tokenUser = req.user

  let authUser

  try {
    authUser = await auth.getUserByEmail(data.email)
  } catch (e) {
    return next(
      generateError(ErrorCode.UserApiError, {
        message: `Auth user with email "${data.email}" does not exist`,
      })
    )
  }

  if (authUser.uid !== tokenUser.uid) {
    if (!roles.editor) {
      return next(
        generateError(ErrorCode.UserApiError, {
          message: 'User does not have a permission to create another user',
        })
      )
    }
    if (!roles.admin && data.is_admin) {
      return next(
        generateError(ErrorCode.UserApiError, {
          message: 'User do not have a permission to create an admin user',
        })
      )
    }
  }

  const community = await CommunityService.getCommunityByID(data.community_id)
  if (!community) {
    return next(generateCommunityNotFoundError(ErrorCode.UserApiError, data.community_id))
  }

  const existingUsers = await UsersService.getUserByUID(authUser.uid)

  if (existingUsers.length > 0) {
    return next(
      generateError(ErrorCode.UserApiError, {
        message: `User with email "${authUser.email}" already exists`,
      })
    )
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
    community: db.community.doc(data.community_id),
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

  const newUser = await UsersService.createUser(newData)

  // get the created user's data
  const result = await newUser.get().then((doc) => ({ ...doc.data(), id: doc.id }))

  return res.json({ status: 'ok', data: result })
}

export default createUser

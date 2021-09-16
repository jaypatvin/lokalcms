import { Request, Response } from 'express'
import { UsersService, ShopsService, CommunityService } from '../../../service'
import validateFields from '../../../utils/validateFields'
import { generateShopKeywords } from '../../../utils/generateKeywords'
import { required_fields } from './index'

/**
 * @openapi
 * /v1/shops:
 *   post:
 *     tags:
 *       - shops
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will create a new shop
 *       # Examples
 *       ```
 *       {
 *         "name": "Secret Shop",
 *         "description": "Description of the secret shop",
 *         "user_id": "document_id_of_owner"
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
 *               name:
 *                 type: string
 *                 required: true
 *               description:
 *                 type: string
 *                 required: true
 *               user_id:
 *                 type: string
 *                 required: true
 *               is_close:
 *                 type: boolean
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: The new shop
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/Shop'
 */
const createShop = async (req: Request, res: Response) => {
  const data = req.body
  const { user_id, name, description, is_close, status, source, profile_photo, cover_photo } = data
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  if (!roles.editor && requestorDocId !== user_id)
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to create a shop for another user.',
    })

  let _user
  let _community

  // check if user id is valid
  try {
    _user = await UsersService.getUserByID(user_id)
    if (_user.status === 'archived')
      return res.status(400).json({
        status: 'error',
        message: `User with id ${user_id} is currently archived!`,
      })
  } catch (e) {
    return res.status(400).json({ status: 'error', message: 'Invalid User ID!' })
  }

  // check if community id is valid
  try {
    _community = await CommunityService.getCommunityByID(_user.community_id)
    if (_community.archived)
      return res.status(400).json({
        status: 'error',
        message: `Community of user ${_user.email} is currently archived!`,
      })
  } catch (e) {
    return res.status(400).json({
      status: 'error',
      message: `Community of user ${_user.email} is does not exist!`,
    })
  }

  const error_fields = validateFields(data, required_fields)
  if (error_fields.length) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Required fields missing', error_fields })
  }

  const keywords = generateShopKeywords({ name })

  const _newData: any = {
    name,
    description,
    user_id,
    community_id: _user.community_id,
    is_close: is_close || false,
    status: status || 'enabled',
    keywords,
    archived: false,
    updated_by: requestorDocId || '',
    updated_from: source || '',
  }

  if (profile_photo) _newData.profile_photo = profile_photo
  if (cover_photo) _newData.cover_photo = cover_photo

  const _newShop = await ShopsService.createShop(_newData)

  // get the created shop's data
  let _result = await _newShop.get().then((doc) => {
    return doc.data()
  })

  // add the shop document id
  _result.id = _newShop.id

  return res.json({ status: 'ok', data: _result })
}

export default createShop

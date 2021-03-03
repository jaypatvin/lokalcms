import { Request, Response } from 'express'
import { UsersService, ShopsService, CommunityService } from '../../../service'
import validateFields from '../../../utils/validateFields'
import { generateShopKeywords } from '../../../utils/generateKeywords'
import { required_fields, hourFormat, timeFormatError } from './index'

/**
 * @openapi
 * /v1/community:
 *   post:
 *     tags:
 *       - community
 *     security:
 *       - bearerAuth: []
 *     description: Create new community
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               user_id:
 *                 type: string
 *               is_close:
 *                 type: boolean
 *               status:
 *                 type: string
 *               opening:
 *                 type: string
 *               closing:
 *                 type: string
 *               use_custom_hours:
 *                 type: boolean
 *               custom_hours:
 *                 type: object
 *                 properties:
 *                   mon:
 *                     type: object
 *                     properties:
 *                       opening:
 *                         type: string
 *                       closing:
 *                         type: string
 *                   tue:
 *                     type: object
 *                     properties:
 *                       opening:
 *                         type: string
 *                       closing:
 *                         type: string
 *                   wed:
 *                     type: object
 *                     properties:
 *                       opening:
 *                         type: string
 *                       closing:
 *                         type: string
 *                   thu:
 *                     type: object
 *                     properties:
 *                       opening:
 *                         type: string
 *                       closing:
 *                         type: string
 *                   fri:
 *                     type: object
 *                     properties:
 *                       opening:
 *                         type: string
 *                       closing:
 *                         type: string
 *                   sat:
 *                     type: object
 *                     properties:
 *                       opening:
 *                         type: string
 *                       closing:
 *                         type: string
 *                   sun:
 *                     type: object
 *                     properties:
 *                       opening:
 *                         type: string
 *                       closing:
 *                         type: string
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
  let _user
  let _community

  // check if user id is valid
  try {
    _user = await UsersService.getUserByID(data.user_id)
    if (_user.status === 'archived')
      return res.status(400).json({
        status: 'error',
        message: `User with id ${data.user_id} is currently archived!`,
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

  // check if correct time format
  if (!hourFormat.test(data.opening))
    return res.status(400).json({
      status: 'error',
      message: timeFormatError('opening', data.opening),
    })
  if (!hourFormat.test(data.closing))
    return res.status(400).json({
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
      return res
        .status(400)
        .json({ status: 'error', message: 'Incorrect time format', custom_hours_errors })
  }

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

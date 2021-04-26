import { Request, Response } from 'express'
import _ from 'lodash'
import dayjs from 'dayjs'
import { UsersService, ShopsService, CommunityService } from '../../../service'
import validateFields from '../../../utils/validateFields'
import { generateShopKeywords } from '../../../utils/generateKeywords'
import { required_fields, hourFormat, dateFormat, timeFormatError, repeatValues } from './index'
import generateSchedule from '../../../utils/generateSchedule'

/**
 * @openapi
 * /v1/shops:
 *   post:
 *     tags:
 *       - shops
 *     security:
 *       - bearerAuth: []
 *     description: Create new shop
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
 *               operating_hours:
 *                 type: object
 *                 properties:
 *                   start_time:
 *                     type: string
 *                   end_time:
 *                     type: string
 *                   start_dates:
 *                     type: array
 *                     items:
 *                       type: string
 *                   repeat:
 *                     type: string
 *                     enum: [none, every_day, every_other_day, every_week, every_other_week, every_month]
 *                   unavailable_dates:
 *                     type: array
 *                     items:
 *                       type: string
 *                   custom_dates:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         date:
 *                           type: string
 *                         start_time:
 *                           type: string
 *                         end_time:
 *                           type: string
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
  const {
    user_id,
    operating_hours,
    name,
    description,
    is_close,
    status,
    source,
    profile_photo,
    cover_photo,
  } = data
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDocId
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

  const { start_time, end_time, start_dates, repeat, unavailable_dates, custom_dates } =
    operating_hours || {}

  if (!_.isEmpty(operating_hours)) {
    const errors = []
    if (_.isEmpty(start_time)) {
      errors.push('start_time is missing.')
    }
    if (_.isEmpty(end_time)) {
      errors.push('end_time is missing.')
    }
    if (_.isEmpty(start_dates)) {
      errors.push('start_dates is missing.')
    }
    if (_.isEmpty(repeat)) {
      errors.push('repeat is missing.')
    }
    if (!_.isEmpty(errors)) {
      return res.status(400).json({ status: 'error', message: 'Required fields missing', errors })
    }

    // check if correct time format
    if (!hourFormat.test(start_time))
      return res.status(400).json({
        status: 'error',
        message: timeFormatError('start_time', start_time),
      })
    if (!hourFormat.test(end_time))
      return res.status(400).json({
        status: 'error',
        message: timeFormatError('end_time', end_time),
      })

    _.forEach(start_dates, (date) => {
      if (!_.isString(date) || !dateFormat.test(date)) {
        errors.push(`Starting date ${date} is not a valid format. Please follow format "2021-12-31`)
      }
      if (!dayjs(date).isValid()) {
        errors.push(`Starting date ${date} is not a valid date.`)
      }
    })

    if (errors.length) {
      return res.status(400).json({ status: 'error', message: 'Invalid starting dates', errors })
    }

    if (!_.includes(repeatValues, repeat)) {
      return res
        .status(400)
        .json({ status: 'error', message: `Repeat can only be one of ${repeatValues}` })
    }

    if (!_.isEmpty(unavailable_dates)) {
      _.forEach(unavailable_dates, (date) => {
        if (!_.isString(date) || !dateFormat.test(date)) {
          errors.push(
            `Unavailable date ${date} is not a valid format. Please follow format "2021-12-31`
          )
        }
        if (!dayjs(date).isValid()) {
          errors.push(`Unavailable date ${date} is not a valid date.`)
        }
      })

      if (errors.length) {
        return res
          .status(400)
          .json({ status: 'error', message: 'Invalid unavailable dates', errors })
      }
    }

    if (!_.isEmpty(custom_dates)) {
      _.forEach(custom_dates, (custom_date) => {
        if (typeof custom_date !== 'object') {
          errors.push('custom date must be an object')
        }
        if (!custom_date.date) {
          errors.push('custom date must have a date field')
        }
        if (!_.isString(custom_date.date) || !dateFormat.test(custom_date.date)) {
          errors.push(
            `custom date ${custom_date.date} is not a valid format. Please follow format "2021-12-31`
          )
        }
        if (!dayjs(custom_date.date).isValid()) {
          errors.push(`custom date ${custom_date.date} is not a valid date.`)
        }
        if (custom_date.start_time && !hourFormat.test(custom_date.start_time))
          errors.push(timeFormatError('start_time', custom_date.start_time))
        if (custom_date.end_time && !hourFormat.test(custom_date.end_time))
          errors.push(timeFormatError('end_time', custom_date.end_time))
      })
      if (errors.length) {
        return res.status(400).json({ status: 'error', message: 'Invalid custom dates', errors })
      }
    }
  } else {
    return res.status(400).json({
      status: 'error',
      message: 'operating_hours is required',
    })
  }

  const keywords = generateShopKeywords({ name })

  const _newData: any = {
    name,
    description,
    user_id,
    community_id: _user.community_id,
    is_close: is_close || false,
    operating_hours: {
      start_time,
      end_time,
      start_dates,
      repeat,
      schedule: generateSchedule({
        start_time,
        end_time,
        start_dates,
        repeat,
        unavailable_dates,
        custom_dates,
      }),
    },
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

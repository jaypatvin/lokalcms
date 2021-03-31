import { Request, Response } from 'express'
import { UsersService, CommunityService, ActivitiesService } from '../../../service'
import validateFields from '../../../utils/validateFields'
import { required_fields } from './index'
import { fieldIsNum } from '../../../utils/helpers'

/**
 * @openapi
 * /v1/activities:
 *   post:
 *     tags:
 *       - activities
 *     security:
 *       - bearerAuth: []
 *     description: Create new activity
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               community_id:
 *                 type: string
 *               user_id:
 *                 type: string
 *               message:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     order:
 *                       type: number

 *     responses:
 *       200:
 *         description: The new activity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/activity'
 */
const createActivity = async (req: Request, res: Response) => {
  const data = req.body
  let _community
  let _user

  const error_fields = validateFields(data, required_fields)
  if (error_fields.length) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Required fields missing', error_fields })
  }

  if (!data.message && !data.images)
    return res
      .status(400)
      .json({ status: 'error', message: 'no message or image is provided for post' })

  // get user and validate
  _user = await UsersService.getUserByID(data.user_id)
  if (!_user) return res.status(400).json({ status: 'error', message: 'Invalid User ID!' })
  if (_user.status === 'archived')
    return res.status(406).json({
      status: 'error',
      message: `User with id ${data.user_id} is currently archived!`,
    })

  let images
  if (data.images) {
    if (!Array.isArray(data.images))
      return res.status(400).json({
        status: 'error',
        message: 'Gallery is not an array of type object: {url: string, order: number}',
      })

    if (data.images.length) {
      for (let [i, g] of data.images.entries()) {
        if (!g.url)
          return res
            .status(400)
            .json({ status: 'error', message: 'Missing image url for item ' + i })

        if (!fieldIsNum(g.order))
          return res
            .status(400)
            .json({ status: 'error', message: 'order is not a type of number for item ' + i })
      }
    }
    images = data.images
  }

  const _activityData: any = {
    message: data.message || '',
    user_id: data.user_id,
    community_id: _user.community_id,
    status: data.status || 'enabled',
    archived: false,
  }

  if (images) _activityData.images = images
  const newActivity = await ActivitiesService.createActivity(_activityData)
  const result = await newActivity.get().then((doc) => doc.data())
  await newActivity
    .collection('images')
    .get()
    .then((res) => {
      result.images = res.docs.map((doc): any => doc.data())
    })
  result.id = newActivity.id
  return res.status(200).json({ status: 'ok', data: result })
}

export default createActivity

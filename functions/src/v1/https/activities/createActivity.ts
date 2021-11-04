import { Request, Response } from 'express'
import { UsersService, ActivitiesService } from '../../../service'
import validateFields from '../../../utils/validateFields'
import { required_fields } from './index'
import { validateImages } from '../../../utils/validateImages'

/**
 * @openapi
 * /v1/activities:
 *   post:
 *     tags:
 *       - activities
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will create a new activity post
 *       # Examples
 *       ```
 *       {
 *         "user_id": "document_id_of_the_user_to_post",
 *         "message": "LF: wedding cake!!!"
 *       }
 *       ```
 *
 *       ```
 *       {
 *         "user_id": "document_id_of_the_user_to_post",
 *         "images": [
 *           {
 *             "url": "url_of_the_photo",
 *             "order": 1
 *           }
 *         ]
 *       }
 *       ```
 *
 *       ```
 *       {
 *         "user_id": "document_id_of_the_user_to_post",
 *         "message": "bili na mga suki",
 *         "images": [
 *           {
 *             "url": "url_of_the_photo",
 *             "order": 1
 *           }
 *         ]
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
 *               user_id:
 *                 type: string
 *                 required: true
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
  const requestorDocId = res.locals.userDoc.id || ''
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
    const validation = validateImages(data.images)
    if (!validation.valid) {
      return res.status(400).json({
        status: 'error',
        message: 'Images are not valid.',
        errors: validation.errorMessages,
      })
    }
    images = data.images
  }

  const _activityData: any = {
    message: data.message || '',
    user_id: data.user_id,
    community_id: _user.community_id,
    status: data.status || 'enabled',
    archived: false,
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  if (images) _activityData.images = images
  const result = await ActivitiesService.createActivity(_activityData)

  return res.status(200).json({ status: 'ok', data: result })
}

export default createActivity

import { RequestHandler } from 'express'
import { ActivityCreateData } from '../../../models/Activity'
import { UsersService, ActivitiesService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'
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
const createActivity: RequestHandler = async (req, res) => {
  const { user_id, images, message = '', status = 'enabled', source = '' } = req.body
  const requestorDocId = res.locals.userDoc.id || ''

  const user = await UsersService.getUserByID(user_id)
  if (!user) {
    throw generateNotFoundError(ErrorCode.ActivityApiError, 'User', user_id)
  }
  if (user.archived) {
    throw generateError(ErrorCode.ActivityApiError, {
      message: `User with id ${user_id} is currently archived`,
    })
  }

  const activityData: ActivityCreateData = {
    message,
    user_id,
    community_id: user.community_id,
    status,
    archived: false,
    updated_by: requestorDocId,
    updated_from: source,
  }

  if (images) activityData.images = images
  const result = await ActivitiesService.createActivity(activityData)

  return res.status(200).json({ status: 'ok', data: result })
}

export default createActivity

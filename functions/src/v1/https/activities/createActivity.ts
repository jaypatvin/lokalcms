import { Request, Response } from 'express'
import { ActivityCreateData } from '../../../models/Activity'
import { UsersService, ActivitiesService } from '../../../service'
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
  const { user_id, images, message = '', status = 'enabled', source = '' } = req.body
  const requestorDocId = res.locals.userDoc.id || ''

  const user = await UsersService.getUserByID(user_id)
  if (!user) return res.status(400).json({ status: 'error', message: 'Invalid User ID!' })
  if (user.archived) {
    return res.status(406).json({
      status: 'error',
      message: `User with id ${user_id} is currently archived!`,
    })
  }

  const _activityData: ActivityCreateData = {
    message,
    user_id,
    community_id: user.community_id,
    status,
    archived: false,
    updated_by: requestorDocId,
    updated_from: source,
  }

  if (images) _activityData.images = images
  const result = await ActivitiesService.createActivity(_activityData)

  return res.status(200).json({ status: 'ok', data: result })
}

export default createActivity

import { Request, Response } from 'express'
import { UsersService, ActivitiesService, CommentsService } from '../../../service'
import { validateFields } from '../../../utils/validations'
import { fieldIsNum } from '../../../utils/helpers'
import { CommentCreateData } from '../../../models/Comment'

/**
 * @openapi
 * /v1/activities/{activityId}/comments:
 *   post:
 *     tags:
 *       - activity comments
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will create a new comment
 *       # Examples
 *       ```
 *       {
 *         "user_id": "document_id_of_the_user_to_comment",
 *         "message": "yummy"
 *       }
 *       ```
 *
 *       ```
 *       {
 *         "user_id": "document_id_of_the_user_to_comment",
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
 *         "user_id": "document_id_of_the_user_to_comment",
 *         "message": "is this available?",
 *         "images": [
 *           {
 *             "url": "url_of_the_photo",
 *             "order": 1
 *           }
 *         ]
 *       }
 *       ```
 *
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         description: document id of the activity
 *         schema:
 *           type: string
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
 *         description: The new comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const createComment = async (req: Request, res: Response) => {
  const { activityId } = req.params
  const data = req.body

  try {
    const activity = await ActivitiesService.getActivityById(activityId)
    if (activity.archived)
      return res.status(400).json({
        status: 'error',
        message: `Activity with id ${activityId} is currently archived!`,
      })
  } catch (e) {
    return res.status(400).json({ status: 'error', message: 'Invalid Activity ID!' })
  }

  // get user and validate
  try {
    const user = await UsersService.getUserByID(data.user_id)
    if (user.archived)
      return res.status(400).json({
        status: 'error',
        message: `User with id ${data.user_id} is currently archived!`,
      })
  } catch (e) {
    return res.status(400).json({ status: 'error', message: 'Invalid User ID!' })
  }

  const commentData: CommentCreateData = {
    message: data.message,
    user_id: data.user_id,
    status: data.status || 'enabled',
    archived: false,
  }
  if (data.images) commentData.images = data.images

  const newComment = await CommentsService.addActivityComment(activityId, commentData)
  const result = await newComment.get().then((doc) => ({ ...doc.data(), id: doc.id }))
  await ActivitiesService.incrementActivityCommentCount(activityId)
  return res.status(200).json({ status: 'ok', data: result })
}

export default createComment

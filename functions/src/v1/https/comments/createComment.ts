import { RequestHandler } from 'express'
import { UsersService, ActivitiesService, CommentsService } from '../../../service'
import { CommentCreateData } from '../../../models/Comment'
import { generateError, ErrorCode, generateNotFoundError } from '../../../utils/generators'

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
const createComment: RequestHandler = async (req, res) => {
  const { activityId } = req.params
  const data = req.body

  const activity = await ActivitiesService.getActivityById(activityId)
  if (!activity) {
    throw generateNotFoundError(ErrorCode.CommentApiError, 'Activity', activityId)
  }
  if (activity.archived) {
    throw generateError(ErrorCode.CommentApiError, {
      message: `Activity with id ${activityId} is currently archived`,
    })
  }

  const user = await UsersService.getUserByID(data.user_id)
  if (!user) {
    throw generateNotFoundError(ErrorCode.CommentApiError, 'User', data.user_id)
  }
  if (user.archived) {
    throw generateError(ErrorCode.CommentApiError, {
      message: `User with id ${data.user_id} is currently archived`,
    })
  }

  const commentData: CommentCreateData = {
    activity_id: activity.id,
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

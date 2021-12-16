import { Request, Response } from 'express'
import { UsersService, ActivitiesService, CommentsService } from '../../../service'
import { validateFields } from '../../../utils/validations'
import { fieldIsNum } from '../../../utils/helpers'

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

  if (!activityId)
    return res.status(400).json({ status: 'error', message: 'activity id is required!' })
  try {
    const _activity = await ActivitiesService.getActivityById(activityId)
    if (_activity.archived)
      return res.status(400).json({
        status: 'error',
        message: `Activity with id ${activityId} is currently archived!`,
      })
  } catch (e) {
    return res.status(400).json({ status: 'error', message: 'Invalid Activity ID!' })
  }

  const error_fields = validateFields(data, ['user_id'])
  if (error_fields.length) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Required fields missing', error_fields })
  }

  if (!data.message && !data.images) {
    return res
      .status(400)
      .json({ status: 'error', message: 'no message or image is provided for comment' })
  }

  // get user and validate
  try {
    const _user = await UsersService.getUserByID(data.user_id)
    if (_user.status === 'archived')
      return res.status(400).json({
        status: 'error',
        message: `User with id ${data.user_id} is currently archived!`,
      })
  } catch (e) {
    return res.status(400).json({ status: 'error', message: 'Invalid User ID!' })
  }

  const commentData: any = {
    message: data.message,
    user_id: data.user_id,
    status: data.status || 'enabled',
    created_at: new Date(),
    archived: false,
  }

  if (data.images) {
    if (!Array.isArray(data.images))
      return res.status(400).json({
        status: 'error',
        message: 'Images is not an array of type object: {url: string, order: number}',
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
    commentData.images = data.images
  }

  const newComment = await CommentsService.addActivityComment(activityId, commentData)
  let result = await newComment.get().then((doc) => doc.data())
  await newComment
    .collection('images')
    .get()
    .then((res) => {
      result.images = res.docs.map((doc) => doc.data())
    })
  result.id = newComment.id
  await ActivitiesService.incrementActivityCommentCount(activityId)
  return res.status(200).json({ status: 'ok', data: result })
}

export default createComment

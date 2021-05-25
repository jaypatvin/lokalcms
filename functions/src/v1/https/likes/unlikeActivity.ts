import { Request, Response } from 'express'
import { UsersService, ActivitiesService, LikesService } from '../../../service'
import validateFields from '../../../utils/validateFields'

/**
 * @openapi
 * /v1/activities/{activityId}/unlike:
 *   delete:
 *     tags:
 *       - activities
 *     security:
 *       - bearerAuth: []
 *     description: Unlike an activity
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

 *     responses:
 *       200:
 *         description: Unlike status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/Activities/Like'
 */
const unlikeActivity = async (req: Request, res: Response) => {
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

  // since delete always succeeds even if the doc does not exist
  // we should check first if we are removing an existing like
  // before decrementing likeCount
  const exists = await LikesService.getActivityLike(activityId, data.user_id)
  if (exists) await ActivitiesService.deccrementActivityLikeCount(activityId)

  const result = await LikesService.removeActivityLike(activityId, data.user_id)
  return res.status(200).json({ status: 'ok', data: result })
}

export default unlikeActivity

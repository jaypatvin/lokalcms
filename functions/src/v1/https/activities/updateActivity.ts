import { Request, Response } from 'express'
import { UsersService, CommunityService, ActivitiesService } from '../../../service'

/**
 * @openapi
 * /v1/activities/{activityId}:
 *   put:
 *     tags:
 *       - activities
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will update a post
 *       # Examples
 *       ```
 *       {
 *         "message": "updated comment"
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
 *               message:
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *         description: Updated activity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const updateActivity = async (req: Request, res: Response) => {
  const { activityId } = req.params
  const data = req.body
  const requestorDocId = res.locals.userDoc.id

  if (!activityId)
    return res.status(400).json({ status: 'error', message: 'activity id is required!' })

  const _activity = await ActivitiesService.getActivityById(activityId)

  if (!_activity) return res.status(400).json({ status: 'error', message: 'Invalid Activity ID!' })

  if (_activity.archived)
    return res.status(400).json({
      status: 'error',
      message: `Activity with id ${activityId} is currently archived!`,
    })

  if (!data.message)
    return res.status(400).json({ status: 'error', message: 'Missing field: message' })

  // get user and validate
  const _user = await UsersService.getUserByID(requestorDocId)

  if (!_user) return res.status(400).json({ status: 'error', message: 'Invalid User ID!' })
  // this should not happen, activity should also be archived
  if (_user.status === 'archived')
    return res.status(406).json({
      status: 'error',
      message: `User with id ${data.user_id} is currently archived!`,
    })

  const _community = await CommunityService.getCommunityByID(_user.community_id)
  if (!_community)
    return res.status(400).json({ status: 'error', message: 'Invalid Community ID!' })
  if (_community.archived)
    return res.status(406).json({
      status: 'error',
      message: `Community ${_community.name} is currently archived`,
    })

  if (requestorDocId !== _activity.user_id) {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to edit the comment.',
    })
  }

  const _result = await ActivitiesService.updateActivity(activityId, {
    message: data.message,
    updated_by: requestorDocId,
    updated_from: data.source || '',
  })

  return res.status(200).json({ status: 'ok', data: _result })
}

export default updateActivity

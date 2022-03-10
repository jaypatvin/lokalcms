import { Request, Response } from 'express'
import { ActivityUpdateData } from '../../../models/Activity'
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
  const { user_id, message, source = '', status } = req.body
  const requestorDocId = res.locals.userDoc.id

  const activity = await ActivitiesService.getActivityById(activityId)
  if (!activity) {
    return res.status(400).json({ status: 'error', message: 'Invalid Activity ID!' })
  }
  if (activity.archived) {
    return res.status(400).json({
      status: 'error',
      message: `Activity with id ${activityId} is currently archived!`,
    })
  }

  const user = await UsersService.getUserByID(requestorDocId)
  if (!user) {
    return res.status(400).json({ status: 'error', message: 'Invalid User ID!' })
  }
  if (user.archived)
    return res.status(400).json({
      status: 'error',
      message: `User with id ${user_id} is currently archived!`,
    })

  const community = await CommunityService.getCommunityByID(user.community_id)
  if (!community) {
    return res.status(400).json({ status: 'error', message: 'Invalid Community ID!' })
  }
  if (community.archived) {
    return res.status(400).json({
      status: 'error',
      message: `Community ${community.name} is currently archived`,
    })
  }

  if (requestorDocId !== activity.user_id) {
    return res.status(400).json({
      status: 'error',
      message: 'You do not have a permission to edit the activity.',
    })
  }

  const updateData: ActivityUpdateData = {
    message,
    updated_by: requestorDocId,
    updated_from: source || '',
  }

  if (status) updateData.status = status

  const result = await ActivitiesService.updateActivity(activityId, updateData)

  return res.status(200).json({ status: 'ok', data: result })
}

export default updateActivity

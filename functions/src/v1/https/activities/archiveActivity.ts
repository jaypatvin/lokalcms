import { Request, Response } from 'express'
import { ActivitiesService, CommentsService } from '../../../service'

/**
 * @openapi
 * /v1/activities/{activityId}:
 *   delete:
 *     tags:
 *       - activities
 *     security:
 *       - bearerAuth: []
 *     description: Archive the activity
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         description: document id of the activity
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archived activity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/Activity'
 */
 const archiveActivity = async (req: Request, res: Response) => {
    const { activityId } = req.params
    const roles = res.locals.userRoles
    const requestorDocId = res.locals.userDocId
    const _activity = await ActivitiesService.getActivityById(activityId)
  
    if (!_activity) return res.status(403).json({ status: 'error', message: 'Activity does not exist!' })
  
    if (!roles.admin && requestorDocId !== _activity.user_id) {
      return res
        .status(403)
        .json({
          status: 'error',
          message: 'You do not have a permission to delete.',
        })
    }
  
    const result = await ActivitiesService.archiveActivity(activityId)
  
    // archive the comments of the activity
    await CommentsService.archiveActivityComments(activityId)
  
    return res.json({ status: 'ok', data: result })
  }
  
  export default archiveActivity
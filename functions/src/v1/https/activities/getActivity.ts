import { RequestHandler } from 'express'
import { ActivitiesService } from '../../../service'
import { generateNotFoundError, ErrorCode } from '../../../utils/generators'

/**
 * @openapi
 * /v1/activities/{activityId}:
 *   get:
 *     tags:
 *       - activities
 *     security:
 *       - bearerAuth: []
 *     description: Return the activity
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         description: document id of the activity
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Single activity
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
const getActivity: RequestHandler = async (req, res) => {
  const { activityId } = req.params
  const requestorDocId = res.locals.userDoc.id

  const activity = await ActivitiesService.findActivityById(activityId, requestorDocId)
  if (!activity) {
    throw generateNotFoundError(ErrorCode.ActivityApiError, 'Activity', activityId)
  }

  return res.status(200).json({ status: 'ok', data: activity })
}

export default getActivity

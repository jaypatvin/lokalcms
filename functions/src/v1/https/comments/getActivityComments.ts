import { RequestHandler } from 'express'
import { ActivitiesService, CommentsService } from '../../../service'
import { generateNotFoundError, ErrorCode } from '../../../utils/generators'

/**
 * @openapi
 * /v1/activities/{activityId}/comments:
 *   get:
 *     tags:
 *       - activity comments
 *     security:
 *       - bearerAuth: []
 *     description: Returns activity comments
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         description: document id of the activity
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The comments of the activity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/Activities/Comments'
 */
const getActivityComments: RequestHandler = async (req, res) => {
  const { activityId } = req.params
  const requestorDocId = res.locals.userDoc.id

  const activity = await ActivitiesService.findById(activityId)
  if (!activity) {
    throw generateNotFoundError(ErrorCode.CommentApiError, 'Activity', activityId)
  }

  const comments = await CommentsService.findAllActivityComments(activityId, requestorDocId)

  return res.status(200).json({ status: 'ok', data: comments })
}

export default getActivityComments

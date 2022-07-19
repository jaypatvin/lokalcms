import { RequestHandler } from 'express'
import { ReportCreateData } from '../../../models/Report'
import { CommunityService, ReportsService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/community/{communityId}/report:
 *   post:
 *     tags:
 *       - reports
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will report a community
 *       # Examples
 *       ```
 *       {
 *         "description": "this community is hiding a wanted person"
 *       }
 *       ```
 *
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         description: document id of the community
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const reportCommunity: RequestHandler = async (req, res) => {
  const { communityId } = req.params
  const { description } = req.body
  const requestor = res.locals.userDoc

  if (requestor.community_id !== communityId) {
    throw generateError(ErrorCode.CommunityApiError, {
      message: 'Cannot report other communities',
    })
  }

  const community = await CommunityService.getCommunityByID(communityId)
  if (!community) {
    throw generateNotFoundError(ErrorCode.CommunityApiError, 'Community', communityId)
  }
  if (community.archived) {
    throw generateError(ErrorCode.CommunityApiError, {
      message: `Community with id ${communityId} is currently archived`,
    })
  }

  const reportData: ReportCreateData = {
    description,
    user_id: requestor.id,
    community_id: communityId,
    report_type: 'community',
  }

  const result = await ReportsService.createCommunityReport(communityId, reportData)

  return res.status(200).json({ status: 'ok', data: result })
}

export default reportCommunity

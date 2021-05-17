import { Request, Response } from 'express'
import { CommunityService } from '../../../service'

/**
 * @openapi
 * /v1/community/{communityId}/unarchive:
 *   put:
 *     tags:
 *       - community
 *     security:
 *       - bearerAuth: []
 *     description: Unarchive the community
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         description: document id of the community
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unarchived community
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/Community'
 */
const unarchiveCommunity = async (req: Request, res: Response) => {
  const data = req.body
  const requestorDocId = res.locals.userDoc.id
  const roles = res.locals.userRoles
  if (!roles.admin) {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to unarchive.',
    })
  }
  const { communityId } = req.params
  if (!communityId)
    return res.status(400).json({ status: 'error', message: 'Community ID is required!' })

  const requestData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  let result: any = ''
  result = await CommunityService.unarchiveCommunity(communityId, requestData)

  return res.json({
    status: 'ok',
    data: result,
    message: `Community ${communityId} successfully unarchived.`,
  })
}

export default unarchiveCommunity

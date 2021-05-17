import { Request, Response } from 'express'
import { CommunityService } from '../../../service'

/**
 * @openapi
 * /v1/community/{communityId}:
 *   delete:
 *     tags:
 *       - community
 *     security:
 *       - bearerAuth: []
 *     description: Archive the community
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         description: document id of the community
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archived community
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
const deleteCommunity = async (req: Request, res: Response) => {
  const roles = res.locals.userRoles
  if (!roles.admin) {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to delete.',
    })
  }
  const data = req.body
  const requestorDocId = res.locals.userDoc.id
  const { communityId, name } = req.params
  if (!communityId)
    return res.status(400).json({ status: 'error', message: 'Community ID is required!' })

  const requestData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  let result: any = ''
  if (data.hard_delete) {
    result = await CommunityService.deleteCommunity(communityId)
  } else {
    result = await CommunityService.archiveCommunity(communityId, requestData)
  }

  return res.json({
    status: 'ok',
    data: result,
    message: `Community ${name || communityId} successfully ${
      data.hard_delete ? 'deleted' : 'archived'
    }.`,
  })
}

export default deleteCommunity

import { RequestHandler } from 'express'
import { ActionTypesService, ApplicationLogService, CommunityService } from '../../../service'
import { generateNotFoundError, ErrorCode } from '../../../utils/generators'

/**
 * @openapi
 * /v1/applicationLogs:
 *   post:
 *     tags:
 *       - application logs
 *     description: |
 *       ### This will create a new application log
 *       # Examples
 *       ## clicking on a product to view
 *       ```
 *       {
 *         "community_id": "id-of-community-where-product-exists",
 *         "action_type": "product_view",
 *         "device_id": "1234-asdf-zxcv-4567",
 *         "associated_document": "product-id"
 *       }
 *       ```
 *
 *       ## failed login
 *       ```
 *       {
 *         "community_id": "id-of-the-community-where-user-is-trying-to-login",
 *         "action_type": "login_failed",
 *         "device_id": "id-of-the-device",
 *         "metadata": {
 *           "email": "unknown_user@friendster.com"
 *         }
 *       }
 *       ```
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               community_id:
 *                 type: string
 *               action_type:
 *                 type: string
 *               device_id:
 *                 type: string
 *               associated_document:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: The new application log
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/ApplicationLog'
 */
const createApplicationLog: RequestHandler = async (req, res) => {
  const data = req.body
  const requestorDocId = res.locals.userDoc.id

  const { community_id, action_type, device_id, associated_document = '', metadata = {} } = data

  const community = await CommunityService.getCommunityByID(community_id)
  if (!community) {
    throw generateNotFoundError(ErrorCode.ApplicationLogApiError, 'Community', community_id)
  }

  const actionType = await ActionTypesService.getActionTypeById(action_type)
  if (!actionType) {
    throw generateNotFoundError(ErrorCode.ApplicationLogApiError, 'ActionType', action_type)
  }

  const logData = {
    is_authenticated: !!requestorDocId,
    user_id: requestorDocId || '',
    community_id,
    action_type,
    device_id,
    associated_document,
    metadata,
  }

  const result = await ApplicationLogService.createApplicationLog(logData)
  const resultData = (await result.get()).data()

  return res.status(200).json({ status: 'ok', data: { id: result.id, ...resultData } })
}

export default createApplicationLog

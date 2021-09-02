import { Request, Response } from 'express'
import { ApplicationLogService } from '../../../service'
import validateFields from '../../../utils/validateFields'
import { required_fields } from './index'

/**
 * @openapi
 * /v1/applicationLogs:
 *   post:
 *     tags:
 *       - application logs
 *     security:
 *       - bearerAuth: []
 *     description: Create new application log
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon_url:
 *                 type: string
 *               cover_url:
 *                 type: string
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
const createApplicationLog = async (req: Request, res: Response) => {
  const data = req.body
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id

  const error_fields = validateFields(data, required_fields)
  if (error_fields.length) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Required fields missing', error_fields })
  }

  // create the object for the new log data
  const logData = {}

  // const _result = await ApplicationLogService.createApplicationLog(logData)

  return res.status(200).json({ status: 'ok' })
}

export default createApplicationLog

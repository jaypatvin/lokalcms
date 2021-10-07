import dayjs from 'dayjs'
import { Request, Response } from 'express'
import { ShopsService } from '../../../service'
import getScheduledAvailableItems from '../../../utils/getScheduledAvailableItems'
import { dateFormat } from '../../../utils/helpers'

/**
 * @openapi
 * /v1/availableShops:
 *   get:
 *     tags:
 *       - shops
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will return list of shops that are available and unavailable
 *       ## Note: The unavailable shops will have an extra fields _nextAvailable_, _nextAvailableDay_ and _availableMessage_
 *     parameters:
 *       - in: query
 *         name: community_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the community to search
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Text to search
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: The date where the shops are available. Format should be YYYY-MM-DD. Default value is current date.
 *     responses:
 *       200:
 *         description: Array of shops
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Shop'
 *                 unavailable_shops:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Shop'
 */
const getAvailableShops = async (req: Request, res: Response) => {
  const { q = '', date = dayjs(new Date()).format('YYYY-MM-DD'), community_id }: any = req.query

  if (!community_id)
    return res.status(400).json({ status: 'error', message: 'community_id is required.' })

  if (!dateFormat.test(date))
    return res
      .status(400)
      .json({ status: 'error', message: 'Incorrect date format. Please follow format YYYY-MM-DD.' })

  const initialWheres = []
  if (q) initialWheres.push(['keywords', 'array-contains', q])

  const allShops = await ShopsService.getCommunityShopsWithFilter({
    community_id,
    wheres: initialWheres,
  })

  const result = getScheduledAvailableItems(allShops, 'operating_hours', { date })

  return res.status(200).json({ status: 'ok', data: result })
}

export default getAvailableShops

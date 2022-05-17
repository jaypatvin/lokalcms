import { RequestHandler } from 'express'
import algoliasearch from 'algoliasearch'
import * as functions from 'firebase-functions'
import { get } from 'lodash'
import { ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/activities:
 *   get:
 *     tags:
 *       - activities
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Text to search
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *       - in: query
 *         name: community
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *     description: Returns activities
 *     responses:
 *       200:
 *         description: List of activities
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
 *                     $ref: '#/components/schemas/Activity'
 */
const getActivities: RequestHandler = async (req, res) => {
  const { searchKey } = res.locals
  const {
    q: query = '',
    page = 0,
    limit: hitsPerPage,
    community,
    status,
    user,
  } = req.query as unknown as {
    q: string
    page: number
    limit: number
    community?: string
    status?: string
    user?: string
  }

  if (!searchKey) {
    throw generateError(ErrorCode.ActivityApiError, {
      message: 'invalid searchKey',
    })
  }

  const appId = get(functions.config(), 'algolia_config.app_id')
  const client = algoliasearch(appId, searchKey)
  const activitiesIndex = client.initIndex('activities')

  const { hits, nbPages, nbHits } = await activitiesIndex.search(query, {
    page,
    hitsPerPage,
    ...(community ? { filters: `community_id:${community}` } : {}),
    ...(user ? { filters: `user_id:${user}` } : {}),
    ...(status ? { filters: `status:${status}` } : {}),
    attributesToHighlight: [],
  })

  return res.json({ status: 'ok', data: hits, pages: nbPages, totalItems: nbHits })
}

export default getActivities

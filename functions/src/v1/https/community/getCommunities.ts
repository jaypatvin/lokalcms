import { RequestHandler } from 'express'
import algoliasearch from 'algoliasearch'
import * as functions from 'firebase-functions'
import { get } from 'lodash'

/**
 * @openapi
 * /v1/communities:
 *   get:
 *     tags:
 *       - communities
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
 *     description: Returns communities
 *     responses:
 *       200:
 *         description: List of communities
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
 *                     $ref: '#/components/schemas/Community'
 */
const getCommunities: RequestHandler = async (req, res) => {
  const {
    q: query = '',
    page = 0,
    limit: hitsPerPage,
  } = req.query as unknown as {
    q: string
    page: number
    limit: number
  }

  const appId = get(functions.config(), 'algolia_config.app_id')
  const apiKey = get(functions.config(), 'algolia_config.api_key')
  const client = algoliasearch(appId, apiKey)
  const communitiesIndex = client.initIndex('communities')

  const { hits, nbPages, nbHits } = await communitiesIndex.search(query, {
    page,
    hitsPerPage,
  })

  return res.json({ status: 'ok', data: hits, pages: nbPages, totalItems: nbHits })
}

export default getCommunities

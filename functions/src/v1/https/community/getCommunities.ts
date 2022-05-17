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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
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
    sortBy,
    sortOrder,
  } = req.query as unknown as {
    q: string
    page: number
    limit: number
    sortBy: 'name' | 'created_at'
    sortOrder: 'asc' | 'desc'
  }

  const appId = get(functions.config(), 'algolia_config.app_id')
  const apiKey = get(functions.config(), 'algolia_config.api_key')
  const client = algoliasearch(appId, apiKey)
  let communitiesIndex
  if (sortBy === 'created_at') {
    if (sortOrder === 'asc') {
      communitiesIndex = client.initIndex('communities_created_at_asc')
    } else {
      communitiesIndex = client.initIndex('communities_created_at_desc')
    }
  } else {
    if (sortOrder === 'asc') {
      communitiesIndex = client.initIndex('communities')
    } else {
      communitiesIndex = client.initIndex('communities_name_desc')
    }
  }

  const { hits, nbPages, nbHits } = await communitiesIndex.search(query, {
    page,
    hitsPerPage,
    attributesToHighlight: [],
  })

  const data = hits.map((hit) => ({
    ...hit,
    id: hit.objectID,
    // @ts-ignore
    created_at: new Date(hit.created_at._seconds * 1000),
    // @ts-ignore
    ...(hit.updated_at ? { updated_at: new Date(hit.updated_at._seconds * 1000) } : {}),
  }))

  return res.json({ status: 'ok', data, pages: nbPages, totalItems: nbHits })
}

export default getCommunities

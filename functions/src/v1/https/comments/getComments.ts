import { RequestHandler } from 'express'
import algoliasearch from 'algoliasearch'
import * as functions from 'firebase-functions'
import { get } from 'lodash'
import { ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/comments:
 *   get:
 *     tags:
 *       - activity comments
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
 *       - in: query
 *         name: community
 *         schema:
 *           type: string
 *       - in: query
 *         name: activity
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
 *     description: Returns comments
 *     responses:
 *       200:
 *         description: List of comments
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
 *                     $ref: '#/components/schemas/Comment'
 */
const getComments: RequestHandler = async (req, res) => {
  const { searchKey } = res.locals
  const {
    q: query = '',
    page = 0,
    limit: hitsPerPage,
    community,
    activity,
    status,
    user,
    sortBy,
    sortOrder,
  } = req.query as unknown as {
    q: string
    page: number
    limit: number
    community?: string
    activity?: string
    status?: string
    user?: string
    sortBy: 'name' | 'created_at'
    sortOrder: 'asc' | 'desc'
  }

  if (!searchKey) {
    throw generateError(ErrorCode.CommentApiError, {
      message: 'invalid searchKey',
    })
  }

  const appId = get(functions.config(), 'algolia_config.app_id')
  const client = algoliasearch(appId, searchKey)
  let commentsIndex
  if (sortOrder === 'asc') {
    commentsIndex = client.initIndex('comments')
  } else {
    commentsIndex = client.initIndex('comments_created_at_desc')
  }

  const filtersArray = []
  if (community) {
    filtersArray.push(`community_id:${community}`)
  }
  if (activity) {
    filtersArray.push(`activity_id:${activity}`)
  }
  if (user) {
    filtersArray.push(`user_id:${user}`)
  }
  if (status) {
    filtersArray.push(`status:${status}`)
  }

  const { hits, nbPages, nbHits } = await commentsIndex.search(query, {
    page,
    hitsPerPage,
    ...(filtersArray.length ? { filters: filtersArray.join(' AND ') } : {}),
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

export default getComments

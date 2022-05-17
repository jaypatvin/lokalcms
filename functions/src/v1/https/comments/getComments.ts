import { RequestHandler } from 'express'
import algoliasearch from 'algoliasearch'
import * as functions from 'firebase-functions'
import { get } from 'lodash'
import { ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/activities/{activityId}/comments:
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
  } = req.query as unknown as {
    q: string
    page: number
    limit: number
    community?: string
    activity?: string
    status?: string
    user?: string
  }

  if (!searchKey) {
    throw generateError(ErrorCode.CommentApiError, {
      message: 'invalid searchKey',
    })
  }

  const appId = get(functions.config(), 'algolia_config.app_id')
  const client = algoliasearch(appId, searchKey)
  const commentsIndex = client.initIndex('comments')

  const { hits, nbPages, nbHits } = await commentsIndex.search(query, {
    page,
    hitsPerPage,
    ...(community ? { filters: `community_id:${community}` } : {}),
    ...(activity ? { filters: `activity_id:${activity}` } : {}),
    ...(user ? { filters: `user_id:${user}` } : {}),
    ...(status ? { filters: `status:${status}` } : {}),
    attributesToHighlight: [],
  })

  return res.json({ status: 'ok', data: hits, pages: nbPages, totalItems: nbHits })
}

export default getComments

import { RequestHandler } from 'express'
import algoliasearch from 'algoliasearch'
import * as functions from 'firebase-functions'
import { get } from 'lodash'
import { ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/users:
 *   get:
 *     tags:
 *       - users
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
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *     description: Returns users
 *     responses:
 *       200:
 *         description: List of users
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
 *                     $ref: '#/components/schemas/User'
 */
const getUsers: RequestHandler = async (req, res) => {
  const { searchKey } = res.locals
  const {
    q: query = '',
    page = 0,
    limit: hitsPerPage,
    community,
    status,
    role,
    sortBy,
    sortOrder,
  } = req.query as unknown as {
    q: string
    page: number
    limit: number
    community?: string
    status: string
    role: string
    sortBy: 'display_name' | 'created_at'
    sortOrder: 'asc' | 'desc'
  }

  if (!searchKey) {
    throw generateError(ErrorCode.UserApiError, {
      message: 'invalid searchKey',
    })
  }

  const appId = get(functions.config(), 'algolia_config.app_id')
  const client = algoliasearch(appId, searchKey)
  let usersIndex
  if (sortBy === 'created_at') {
    if (sortOrder === 'asc') {
      usersIndex = client.initIndex('users_created_at_asc')
    } else {
      usersIndex = client.initIndex('users_created_at_desc')
    }
  } else {
    if (sortOrder === 'asc') {
      usersIndex = client.initIndex('users')
    } else {
      usersIndex = client.initIndex('users_name_desc')
    }
  }

  const { hits, nbPages, nbHits } = await usersIndex.search(query, {
    page,
    hitsPerPage,
    ...(community ? { filters: `community_id:${community}` } : {}),
    ...(status ? { filters: `status:${status}` } : {}),
    ...(role ? { filters: `roles.${role}:true` } : {}),
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

export default getUsers

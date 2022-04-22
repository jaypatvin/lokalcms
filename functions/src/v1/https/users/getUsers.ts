import { RequestHandler } from 'express'
import algoliasearch from 'algoliasearch'
import * as functions from 'firebase-functions'
import { get } from 'lodash'

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
  const {
    q: query = '',
    page = 0,
    limit: hitsPerPage,
  } = req.query as unknown as { q: string; page: number; limit: number }

  const appId = get(functions.config(), 'algolia_config.app_id')
  const apiKey = get(functions.config(), 'algolia_config.api_key')
  const client = algoliasearch(appId, apiKey)
  const usersIndex = client.initIndex('users')

  const hits = await usersIndex.search(query, {
    page,
    hitsPerPage,
  })

  return res.json({ status: 'ok', data: hits })
}

export default getUsers

import { RequestHandler } from 'express'
import algoliasearch from 'algoliasearch'
import * as functions from 'firebase-functions'
import { get } from 'lodash'
import { ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/chats:
 *   get:
 *     tags:
 *       - chats
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
 *         name: shop
 *         schema:
 *           type: string
 *       - in: query
 *         name: product
 *         schema:
 *           type: string
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *     description: Returns chats
 *     responses:
 *       200:
 *         description: List of chats
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
 *                     $ref: '#/components/schemas/Chat'
 */
const getChats: RequestHandler = async (req, res) => {
  const { searchKey } = res.locals
  const {
    q: query = '',
    page = 0,
    limit: hitsPerPage,
    community,
    shop,
    product,
    user,
  } = req.query as unknown as {
    q: string
    page: number
    limit: number
    community?: string
    shop?: string
    product?: string
    user?: string
  }

  if (!searchKey) {
    throw generateError(ErrorCode.ChatApiError, {
      message: 'invalid searchKey',
    })
  }

  const appId = get(functions.config(), 'algolia_config.app_id')
  const client = algoliasearch(appId, searchKey)
  const chatsIndex = client.initIndex('chats')

  const { hits } = await chatsIndex.search(query, {
    page,
    hitsPerPage,
    ...(community ? { filters: `community_id:${community}` } : {}),
    ...(shop ? { filters: `shop_id:${shop}` } : {}),
    ...(product ? { filters: `product_id:${product}` } : {}),
    ...(user ? { filters: `members:${user}` } : {}),
    attributesToHighlight: [],
  })

  return res.json({ status: 'ok', data: hits })
}

export default getChats

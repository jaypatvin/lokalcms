import { RequestHandler } from 'express'
import algoliasearch from 'algoliasearch'
import * as functions from 'firebase-functions'
import { get } from 'lodash'
import { ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/conversations:
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
 *         name: chat
 *         schema:
 *           type: string
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *     description: Returns conversations
 *     responses:
 *       200:
 *         description: List of conversations
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
 *                     $ref: '#/components/schemas/ChatMessage'
 */
const getConversations: RequestHandler = async (req, res) => {
  const { searchKey } = res.locals
  const {
    q: query = '',
    page = 0,
    limit: hitsPerPage,
    community,
    chat,
    user,
  } = req.query as unknown as {
    q: string
    page: number
    limit: number
    community?: string
    chat?: string
    user?: string
  }

  if (!searchKey) {
    throw generateError(ErrorCode.ChatApiError, {
      message: 'invalid searchKey',
    })
  }

  const appId = get(functions.config(), 'algolia_config.app_id')
  const client = algoliasearch(appId, searchKey)
  const conversationsIndex = client.initIndex('conversations')

  const { hits } = await conversationsIndex.search(query, {
    page,
    hitsPerPage,
    ...(community ? { filters: `community_id:${community}` } : {}),
    ...(chat ? { filters: `chat_id:${chat}` } : {}),
    ...(user ? { filters: `sender_id:${user}` } : {}),
  })

  return res.json({ status: 'ok', data: hits })
}

export default getConversations

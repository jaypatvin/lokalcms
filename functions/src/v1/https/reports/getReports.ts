import { RequestHandler } from 'express'
import algoliasearch from 'algoliasearch'
import * as functions from 'firebase-functions'
import { get } from 'lodash'
import { ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/reports:
 *   get:
 *     tags:
 *       - reports
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
 *         name: reporter
 *         schema:
 *           type: string
 *       - in: query
 *         name: reported
 *         schema:
 *           type: string
 *       - in: query
 *         name: activity
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
 *         name: reportType
 *         schema:
 *           type: string
 *     description: Returns reports
 *     responses:
 *       200:
 *         description: List of reports
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
 *                     $ref: '#/components/schemas/Report'
 */
const getReports: RequestHandler = async (req, res) => {
  const { searchKey } = res.locals
  const {
    q: query = '',
    page = 0,
    limit: hitsPerPage,
    community,
    sortBy,
    sortOrder,
    reporter,
    reported,
    activity,
    shop,
    product,
    reportType,
  } = req.query as unknown as {
    q: string
    page: number
    limit: number
    community?: string
    reporter?: string
    reported?: string
    activity?: string
    shop?: string
    product?: string
    sortBy: 'created_at'
    sortOrder: 'asc' | 'desc'
    reportType?: 'activity' | 'shop' | 'product'
  }

  if (!searchKey) {
    throw generateError(ErrorCode.ActivityApiError, {
      message: 'invalid searchKey',
    })
  }

  const appId = get(functions.config(), 'algolia_config.app_id')
  const client = algoliasearch(appId, searchKey)
  const reportsIndex = client.initIndex('reports')

  const filtersArray = []
  if (community) {
    filtersArray.push(`community_id:${community}`)
  }
  if (reporter) {
    filtersArray.push(`user_id:${reporter}`)
  }
  if (reported) {
    filtersArray.push(`reported_user_id:${reported}`)
  }
  if (activity) {
    filtersArray.push(`activity_id:${activity}`)
  }
  if (shop) {
    filtersArray.push(`shop_id:${shop}`)
  }
  if (product) {
    filtersArray.push(`product_id:${product}`)
  }
  if (reportType) {
    filtersArray.push(`report_type:${reportType}`)
  }

  const { hits, nbPages, nbHits } = await reportsIndex.search(query, {
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

export default getReports

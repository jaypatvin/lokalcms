import { RequestHandler } from 'express'
import algoliasearch from 'algoliasearch'
import * as functions from 'firebase-functions'
import { get } from 'lodash'
import { ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/products:
 *   get:
 *     tags:
 *       - products
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
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: shop
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
 *     description: Returns products
 *     responses:
 *       200:
 *         description: List of products
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
 *                     $ref: '#/components/schemas/Product'
 */
const getProducts: RequestHandler = async (req, res) => {
  const { searchKey } = res.locals
  const {
    q: query = '',
    page = 0,
    limit: hitsPerPage,
    community,
    category,
    shop,
    status,
    user,
    sortBy,
    sortOrder,
  } = req.query as unknown as {
    q: string
    page: number
    limit: number
    community?: string
    category?: string
    shop?: string
    status?: string
    user?: string
    sortBy: 'name' | 'created_at' | 'base_price'
    sortOrder: 'asc' | 'desc'
  }

  if (!searchKey) {
    throw generateError(ErrorCode.ProductApiError, {
      message: 'invalid searchKey',
    })
  }

  const appId = get(functions.config(), 'algolia_config.app_id')
  const client = algoliasearch(appId, searchKey)
  let productsIndex
  if (sortBy === 'created_at') {
    if (sortOrder === 'asc') {
      productsIndex = client.initIndex('products_created_at_asc')
    } else {
      productsIndex = client.initIndex('products_created_at_desc')
    }
  } else if (sortBy === 'base_price') {
    if (sortOrder === 'asc') {
      productsIndex = client.initIndex('products_price_asc')
    } else {
      productsIndex = client.initIndex('products_price_desc')
    }
  } else {
    if (sortOrder === 'asc') {
      productsIndex = client.initIndex('products')
    } else {
      productsIndex = client.initIndex('products_name_desc')
    }
  }

  const filtersArray = []
  if (community) {
    filtersArray.push(`community_id:${community}`)
  }
  if (category) {
    filtersArray.push(`product_category:${category}`)
  }
  if (shop) {
    filtersArray.push(`shop_id:${shop}`)
  }
  if (user) {
    filtersArray.push(`user_id:${user}`)
  }
  if (status) {
    filtersArray.push(`status:${status}`)
  }

  const { hits, nbPages, nbHits } = await productsIndex.search(query, {
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

export default getProducts

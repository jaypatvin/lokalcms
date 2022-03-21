import { RequestHandler } from 'express'
import { CategoriesService } from '../../../service'
import { generateError, ErrorCode } from '../../../utils/generators'

/**
 * @openapi
 * /v1/categories:
 *   get:
 *     tags:
 *       - categories
 *     security:
 *       - bearerAuth: []
 *     description: Return the category
 *     responses:
 *       200:
 *         description: List of Categories
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
 *                   $ref: '#/components/schemas/Category'
 */
const getCategories: RequestHandler = async (req, res) => {
  const categories = await CategoriesService.getAllCategories()

  if (!categories.length) {
    throw generateError(ErrorCode.CategoryApiError, {
      message: 'No categories found',
    })
  }

  // delete this if we want to return keywords
  categories.forEach((category) => delete category.keywords)

  return res.json({ status: 'ok', data: categories })
}

export default getCategories

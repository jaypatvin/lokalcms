import { RequestHandler } from 'express'
import { CategoriesService } from '../../../service'
import { generateNotFoundError, ErrorCode } from '../../../utils/generators'

/**
 * @openapi
 * /v1/categories/{categoryId}:
 *   get:
 *     tags:
 *       - categories
 *     security:
 *       - bearerAuth: []
 *     description: Return the category
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: document id of the category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 */
const getCategory: RequestHandler = async (req, res) => {
  const { categoryId } = req.params

  const category = await CategoriesService.findById(categoryId)
  if (!category) {
    throw generateNotFoundError(ErrorCode.CategoryApiError, 'Category', categoryId)
  }

  delete category.keywords
  return res.json({ status: 'ok', data: category })
}

export default getCategory

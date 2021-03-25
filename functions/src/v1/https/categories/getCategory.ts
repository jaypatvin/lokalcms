import { Request, Response } from 'express'
import { CategoriesService } from '../../../service'

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
const getCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params
  const category = await CategoriesService.getCategoryById(categoryId)

  if (!category)
    return res.status(403).json({ status: 'error', message: 'Category does not exist!' })

  delete category.keywords
  return res.json({ status: 'ok', data: category })
}

export default getCategory

import { Request, Response } from 'express'
import { CategoriesService } from '../../../service'

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
const getCategories = async (req: Request, res: Response) => {
  const categories = await CategoriesService.getAllCategories()

  if (!categories.length)
    return res.status(403).json({ status: 'error', message: 'No categories found' })

  // delete this if we want to return keywords
  categories.forEach((category) => delete category.keywords)

  return res.json({ status: 'ok', data: categories })
}

export default getCategories

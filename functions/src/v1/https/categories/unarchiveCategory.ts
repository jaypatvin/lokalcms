import { Request, Response } from 'express'
import { CategoriesService } from '../../../service'

/**
 * @openapi
 * /v1/categories/{categoryId}:
 *   put:
 *     tags:
 *       - categories
 *     security:
 *       - bearerAuth: []
 *     description: Enable the category
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: document id of the category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Enabled Category
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
const unarchiveCategory = async (req: Request, res: Response) => {
  const roles = res.locals.userRoles
  if (!roles.admin) {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to unarchive.',
    })
  }
  
  const { categoryId } = req.params
  const _category = await CategoriesService.getCategoryById(categoryId)

  if (!_category)
    return res.status(403).json({ status: 'error', message: 'Category does not exist!' })

  const result = await CategoriesService.unarchiveCategory(categoryId)
  return res.json({ status: 'ok', data: result })
}

export default unarchiveCategory

import { Request, Response } from 'express'
import { CategoriesService } from '../../../service'

/**
 * @openapi
 * /v1/categories/{categoryId}:
 *   delete:
 *     tags:
 *       - categories
 *     security:
 *       - bearerAuth: []
 *     description: Disable the category
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: document id of the category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Disabled Category
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
const archiveCategory = async (req: Request, res: Response) => {
  const data = req.body
  const requestorDocId = res.locals.userDocId
  const roles = res.locals.userRoles
  if (!roles.admin) {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to delete.',
    })
  }

  const { categoryId } = req.params
  const _category = await CategoriesService.getCategoryById(categoryId)

  if (!_category)
    return res.status(403).json({ status: 'error', message: 'Category does not exist!' })

  const requestData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  const result = await CategoriesService.archiveCategory(categoryId, requestData)
  return res.json({ status: 'ok', data: result })
}

export default archiveCategory

import { RequestHandler } from 'express'
import { CategoriesService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/categories/{categoryId}:
 *   delete:
 *     tags:
 *       - categories
 *     security:
 *       - bearerAuth: []
 *     description: Archive the category
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: document id of the category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archived Category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const archiveCategory: RequestHandler = async (req, res) => {
  const data = req.body
  const requestorDocId = res.locals.userDoc.id
  const roles = res.locals.userRoles
  if (!roles.admin) {
    throw generateError(ErrorCode.CategoryApiError, {
      message: 'User does not have a permission to delete a category',
    })
  }

  const { categoryId } = req.params
  const category = await CategoriesService.getCategoryById(categoryId)
  if (!category) {
    throw generateNotFoundError(ErrorCode.CategoryApiError, 'Category', categoryId)
  }

  const requestData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  const result = await CategoriesService.archiveCategory(categoryId, requestData)
  return res.json({ status: 'ok', data: result })
}

export default archiveCategory

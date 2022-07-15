import { RequestHandler } from 'express'
import { isNil } from 'lodash'
import { CategoryUpdateData } from '../../../models/Category'
import { CategoriesService } from '../../../service'
import { generateError, ErrorCode, generateNotFoundError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/categories/{categoryId}:
 *   put:
 *     tags:
 *       - categories
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will update a category
 *       # Examples
 *       ```
 *       {
 *         "description": "new description of the cateogry"
 *       }
 *       ```
 *
 *       ```
 *       {
 *         "icon_url": "url_of_the_new_icon_image",
 *         "cover_url": "url_of_the_new_cover_image"
 *       }
 *       ```
 *
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: document id of the product
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               icon_url:
 *                 type: string
 *               cover_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: The new category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const updateCategory: RequestHandler = async (req, res) => {
  const { categoryId } = req.params
  const data = req.body
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  if (!roles.admin) {
    throw generateError(ErrorCode.CategoryApiError, {
      message: 'User does not have a permission to update a category',
    })
  }

  // check if category exists
  const product = await CategoriesService.findById(categoryId)
  if (!product) {
    throw generateNotFoundError(ErrorCode.CategoryApiError, 'Category', categoryId)
  }

  const updateData: CategoryUpdateData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }
  if (data.description) updateData.description = data.description
  if (!isNil(data.icon_url)) updateData.icon_url = data.icon_url
  if (!isNil(data.cover_url)) updateData.cover_url = data.cover_url
  if (data.status) updateData.status = data.status

  const result = await CategoriesService.update(categoryId, updateData)

  return res.status(200).json({ status: 'ok', data: result })
}

export default updateCategory

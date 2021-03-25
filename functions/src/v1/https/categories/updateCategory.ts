import { Request, Response } from 'express'
import { CategoriesService } from '../../../service'
import { generateCategoryKeywords } from '../../../utils/generateKeywords'

/**
 * @openapi
 * /v1/categories/{categoryId}:
 *   post:
 *     tags:
 *       - categories
 *     security:
 *       - bearerAuth: []
 *     description: Update category
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
 *               name:
 *                 type: string
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
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 */
const updateCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params
  const data = req.body
  const roles = res.locals.userRoles
  if (!roles.admin)
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to update a category',
    })

  if (!categoryId) return res.status(400).json({ status: 'error', message: 'id is required!' })

  // check if category exists
  const product = await CategoriesService.getCategoryById(categoryId)
  if (!product) return res.status(404).json({ status: 'error', message: 'Invalid Category Id!' })

  const updateData: any = {}
  if (data.description) updateData.description = data.description
  if (data.icon_url) updateData.icon_url = data.icon_url
  if (data.cover_url) updateData.cover_url = data.cover_url
  if (data.hasOwnProperty('status')) updateData.status = data.status

  if (!Object.keys(updateData).length)
    return res.status(400).json({ status: 'error', message: 'no field for category is provided' })

  const _result = await CategoriesService.updateCategory(categoryId, updateData)

  return res.status(200).json({ status: 'ok', data: _result })
}

export default updateCategory

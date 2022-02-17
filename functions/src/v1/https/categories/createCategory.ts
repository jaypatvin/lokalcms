import { Request, Response } from 'express'
import { CategoriesService } from '../../../service'
import { generateCategoryKeywords } from '../../../utils/generators'
import { validateFields } from '../../../utils/validations'
import { required_fields } from './index'

/**
 * @openapi
 * /v1/categories:
 *   post:
 *     tags:
 *       - categories
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will create a new category
 *       # Examples
 *       ```
 *       {
 *         "name": "toys",
 *         "description": "i dont know, something about toys",
 *         "icon_url": "url_of_the_icon_image",
 *         "cover_url": "url_of_the_cover_image"
 *       }
 *       ```
 *
 *       ```
 *       {
 *         "name": "gadgets"
 *       }
 *       ```
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
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
const createCategory = async (req: Request, res: Response) => {
  const data = req.body
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  if (!roles.admin)
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to create a category',
    })

  const keywords = generateCategoryKeywords({
    name: data.name,
  })

  const categoryData = {
    name: data.name,
    description: data.description || '',
    icon_url: data.icon_url || '',
    cover_url: data.cover_url || '',
    status: data.status || 'enabled',
    keywords,
    archived: false,
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  const result = await CategoriesService.createCategory(categoryData)

  return res.status(200).json({ status: 'ok', data: result })
}

export default createCategory

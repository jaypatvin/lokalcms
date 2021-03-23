import { Request, Response } from 'express'
import { CategoriesService } from '../../../service'
import { generateCategoryKeywords } from '../../../utils/generateKeywords'
import validateFields from '../../../utils/validateFields'
import { required_fields } from './index'

/**
 * @openapi
 * /v1/categories:
 *   post:
 *     tags:
 *       - categories
 *     security:
 *       - bearerAuth: []
 *     description: Create new category
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
const createCategory = async (req: Request, res: Response) => {
  const data = req.body
  const roles = res.locals.userRoles
  if (!roles.admin)
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to create a category',
    })

  const error_fields = validateFields(data, required_fields)
  if (error_fields.length) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Required fields missing', error_fields })
  }

  const keywords = generateCategoryKeywords({
    name: data.name,
  })

  const _categoryData: any = {
    name: data.name,
    description: data.description || '',
    icon_url: data.icon_url || '',
    cover_url: data.cover_url || '',
    status: 'enabled',
    keywords,
    archived: false,
  }

  const _newCategory = await CategoriesService.createCategory(_categoryData)

  let _result = await _newCategory.get().then((doc) => doc.data())
  _result.id = _newCategory.id
  delete _result.keywords

  return res.status(200).json({ status: 'ok', data: _result })
}

export default createCategory

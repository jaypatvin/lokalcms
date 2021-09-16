import { Request, Response } from 'express'
import { ShopsService } from '../../../service'
import { validateValue } from '../../../utils/validateFields'
import { generateShopKeywords } from '../../../utils/generateKeywords'

/**
 * @openapi
 * /v1/shops/{shopId}:
 *   put:
 *     tags:
 *       - shops
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will update a shop
 *       # Examples
 *       ### updating the name and description
 *       ```
 *       {
 *         "name": "Angel's Burger 2",
 *         "description": "bigger patty but bigger bun"
 *       }
 *       ```
 *
 *       ### closing the shop
 *       ```
 *       {
 *         "is_close": true
 *       }
 *
 *       ### disabling the shop
 *       ```
 *       {
 *         "status": "enabled"
 *       }
 *       ```
 *
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         description: document id of the shop
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
 *               is_close:
 *                 type: boolean
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated shop
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const updateShop = async (req: Request, res: Response) => {
  const { shopId } = req.params
  const data = req.body
  const { name, description, is_close, source, profile_photo, cover_photo } = data

  if (!shopId) return res.status(400).json({ status: 'error', message: 'id is required!' })

  const currentShop = await ShopsService.getShopByID(shopId)

  if (!currentShop)
    return res.status(400).json({ status: 'error', message: 'Shop does not exist!' })

  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  if (!roles.editor && requestorDocId !== currentShop.user_id)
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to update a shop of another user.',
    })

  const updateData: any = {
    updated_by: requestorDocId || '',
    updated_from: source || '',
  }
  if (name) {
    updateData.name = name
    updateData.keywords = generateShopKeywords({ name })
  }
  if (description) updateData.description = description
  if (validateValue(is_close)) updateData.is_close = is_close
  if (profile_photo) updateData.profile_photo = profile_photo
  if (cover_photo) updateData.cover_photo = cover_photo

  if (!Object.keys(updateData).length)
    return res.status(400).json({ status: 'error', message: 'no field for shop is provided' })

  const result = await ShopsService.updateShop(shopId, updateData)

  return res.json({ status: 'ok', data: result })
}

export default updateShop

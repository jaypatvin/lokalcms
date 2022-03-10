import { Request, Response } from 'express'
import { isBoolean } from 'lodash'
import { ProductUpdateData } from '../../../models/Product'
import { NotificationsService, ProductsService } from '../../../service'
import { generateProductKeywords } from '../../../utils/generators'

/**
 * @openapi
 * /v1/products/{productId}:
 *   put:
 *     tags:
 *       - products
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will update a product
 *       # Examples
 *       ```
 *       {
 *         "name": "new product name",
 *         "description": "new description for the product"
 *       }
 *       ```
 *
 *       ```
 *       {
 *         "base_price": 100
 *       }
 *       ```
 *
 *       ```
 *       {
 *         "status": "disabled"
 *       }
 *       ```
 *
 *     parameters:
 *       - in: path
 *         name: productId
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
 *               base_price:
 *                 type: number
 *               quantity:
 *                 type: number
 *               product_category:
 *                 type: string
 *               status:
 *                 type: string
 *               can_subscribe:
 *                 type: boolean
 *               gallery:
 *                 type: object
 *                 properties:
 *                   url:
 *                     type: string
 *                   order:
 *                     type: number
 *     responses:
 *       200:
 *         description: Updated product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const updateProduct = async (req: Request, res: Response) => {
  const { productId } = req.params
  const data = req.body

  // check if product exists
  const product = await ProductsService.getProductByID(productId)
  if (!product) return res.status(404).json({ status: 'error', message: 'Invalid Product Id!' })

  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  if (!roles.editor && requestorDocId !== product.user_id) {
    return res.status(400).json({
      status: 'error',
      message: 'You do not have a permission to update a product of another user.',
    })
  }

  const updateData: ProductUpdateData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  if (data.name || data.product_category) {
    const keywords = generateProductKeywords({
      name: data.name || product.name,
      product_category: data.product_category || product.product_category,
    })
    updateData.keywords = keywords
  }

  if (data.name) updateData.name = data.name
  if (data.description) updateData.description = data.description
  // there might be a better way to write these nested ifs
  if (data.base_price >= 0) {
    updateData.base_price = data.base_price
  }
  if (data.quantity >= 0) {
    updateData.quantity = data.quantity
  }
  if (data.gallery) {
    if (product.gallery) {
      updateData.gallery = product.gallery
      data.gallery.forEach((new_photo: any) => {
        const currentPhoto = updateData.gallery.find(
          (photo: any) => photo.order === new_photo.order
        )
        if (currentPhoto) {
          currentPhoto.url = new_photo.url
        } else {
          updateData.gallery.push(new_photo)
        }
      })
    } else {
      updateData.gallery = data.gallery
    }
  }
  if (data.product_category) updateData.product_category = data.product_category
  if (data.status) updateData.status = data.status
  if (isBoolean(data.can_subscribe)) updateData.can_subscribe = data.can_subscribe

  if (!Object.keys(updateData).length)
    return res.status(400).json({ status: 'error', message: 'no field for shop is provided' })

  const result = await ProductsService.updateProduct(productId, updateData)

  if (!product.quantity && updateData.quantity) {
    // notify users who wishlisted the product if theres new stock
    const notificationData = {
      type: 'wishlist',
      title: `${product.name} is now available`,
      message: `There are new stock for ${product.name}`,
      associated_collection: 'products',
      associated_document: product.id,
    }

    const wishlistUsers = (await product.wishlists.get()).docs.map((doc) => doc.data().user_id)

    for (const userId of wishlistUsers) {
      await NotificationsService.createUserNotification(userId, notificationData)
    }
  }

  return res.json({ status: 'ok', data: result })
}

export default updateProduct

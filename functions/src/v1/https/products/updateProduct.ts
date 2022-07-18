import { RequestHandler } from 'express'
import { isBoolean } from 'lodash'
import { ProductUpdateData } from '../../../models/Product'
import { NotificationsService, ProductsService, WishlistsService } from '../../../service'
import {
  ErrorCode,
  generateError,
  generateNotFoundError,
  generateProductKeywords,
} from '../../../utils/generators'

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
const updateProduct: RequestHandler = async (req, res) => {
  const { productId } = req.params
  const data = req.body

  const product = await ProductsService.findById(productId)
  if (!product) {
    throw generateNotFoundError(ErrorCode.ProductApiError, 'Product', productId)
  }

  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  if (!roles.editor && requestorDocId !== product.user_id) {
    throw generateError(ErrorCode.ProductApiError, {
      message: 'User does not have a permission to update a product of another user',
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
        const currentPhoto = updateData.gallery?.find(
          (photo: any) => photo.order === new_photo.order
        )
        if (currentPhoto) {
          currentPhoto.url = new_photo.url
        } else {
          updateData.gallery?.push(new_photo)
        }
      })
    } else {
      updateData.gallery = data.gallery
    }
  }
  if (data.product_category) updateData.product_category = data.product_category
  if (data.status) updateData.status = data.status
  if (isBoolean(data.can_subscribe)) updateData.can_subscribe = data.can_subscribe

  const result = await ProductsService.update(productId, updateData)

  if (!product.quantity && updateData.quantity) {
    // notify users who wishlisted the product if theres new stock
    const notificationData = {
      type: 'wishlist',
      title: `${product.name} is now available`,
      message: `There are new stock for ${product.name}`,
      associated_collection: 'products',
      associated_document: product.id,
    }

    const wishlistUsers =
      (await WishlistsService.findAllProductWishlists(product.id)).map((w) => w.user_id) ?? []

    for (const userId of wishlistUsers) {
      await NotificationsService.create(userId, notificationData)
    }
  }

  return res.json({ status: 'ok', data: result })
}

export default updateProduct

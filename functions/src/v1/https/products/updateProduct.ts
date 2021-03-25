import { Request, Response } from 'express'
import { ProductsService } from '../../../service'
import { generateProductKeywords } from '../../../utils/generateKeywords'
import { fieldIsNum } from '../../../utils/helpers'

/**
 * @openapi
 * /v1/products/{productId}:
 *   put:
 *     tags:
 *       - products
 *     security:
 *       - bearerAuth: []
 *     description: Update product
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
 *               shop_id:
 *                 type: string
 *               base_price:
 *                 type: number
 *               quantity:
 *                 type: number
 *               product_category:
 *                 type: string
 *               status:
 *                 type: string
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
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 */
const updateProduct = async (req: Request, res: Response) => {
  const { productId } = req.params
  const data = req.body

  if (!productId) return res.status(400).json({ status: 'error', message: 'id is required!' })

  // check if product exists
  const product = await ProductsService.getProductByID(productId)
  if (!product) return res.status(404).json({ status: 'error', message: 'Invalid Product Id!' })

  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDocId
  if (!roles.editor && requestorDocId !== product.user_id)
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to update a product of another user.',
    })

  if (data.gallery) {
    if (!Array.isArray(data.gallery))
      return res.status(400).json({
        status: 'error',
        message: 'Gallery is not an array of type object: {url: string, order: number}',
      })

    for (let [i, g] of data.gallery.entries()) {
      if (!g.hasOwnProperty('url'))
        return res
          .status(400)
          .json({ status: 'error', message: 'Missing gallery url for item ' + i })

      if (!fieldIsNum(g.order))
        return res
          .status(400)
          .json({ status: 'error', message: 'order is not a type of number for item ' + i })
    }
  }

  const updateData: any = {}

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
  if (data.base_price) {
    if (!fieldIsNum(data.base_price))
      return res
        .status(400)
        .json({ status: 'error', message: 'Base Price is not a type of number' })
    updateData.base_price = data.base_price
  }
  if (data.quantity) {
    if (!fieldIsNum(data.quantity))
      return res.status(400).json({ status: 'error', message: 'Quantity is not a type of number' })
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

  if (!Object.keys(updateData).length)
    return res.status(400).json({ status: 'error', message: 'no field for shop is provided' })

  const result = await ProductsService.updateProduct(productId, updateData)

  return res.json({ status: 'ok', data: result })
}

export default updateProduct

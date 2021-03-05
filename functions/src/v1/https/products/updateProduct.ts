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
 *                 type: boolean
 *               quantity:
 *                 type: string
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
  const data = req.body

  if (!data.id) return res.status(400).json({ status: 'error', message: 'id is required!' })

  // check if product exists
  const product = await ProductsService.getProductByID(data.id)
  if (!product) return res.status(404).json({ status: 'error', message: 'Invalid Product Id!' })

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
    if (data.gallery['order'] != null && !fieldIsNum(data.gallery['order']))
      return res.status(400).json({ status: 'error', message: 'order is not a type of number' })

    // user can update either the order, the gallery url, or both
    updateData.gallery = {
      url: data.gallery['url'] ?? product.gallery['url'],
      order: data.gallery['order'] != null ? +data.gallery['order'] : +product.gallery['order'],
    }
  }
  if (data.product_category) updateData.product_category = data.product_category

  if (!Object.keys(updateData).length)
    return res.status(400).json({ status: 'error', message: 'no field for shop is provided' })

  const result = await ProductsService.updateProduct(data.id, updateData)

  return res.json({ status: 'ok', data: result })
}

export default updateProduct
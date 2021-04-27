import { Request, Response } from 'express'
import { UsersService, ShopsService, CommunityService, ProductsService } from '../../../service'
import validateFields from '../../../utils/validateFields'
import { generateProductKeywords } from '../../../utils/generateKeywords'
import { required_fields } from './index'
import { fieldIsNum } from '../../../utils/helpers'

/**
 * @openapi
 * /v1/products:
 *   post:
 *     tags:
 *       - products
 *     security:
 *       - bearerAuth: []
 *     description: Create new product
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
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     order:
 *                       type: number
 *
 *     responses:
 *       200:
 *         description: The new product
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
const createProduct = async (req: Request, res: Response) => {
  const data = req.body
  let _shop
  let _community
  let _user

  const error_fields = validateFields(data, required_fields)
  if (error_fields.length) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Required fields missing', error_fields })
  }

  // shop ID validation
  _shop = await ShopsService.getShopByID(data.shop_id)
  if (!_shop) return res.status(400).json({ status: 'error', message: 'Invalid Shop ID!' })
  if (_shop.status === 'disabled')
    return res
      .status(406)
      .json({ status: 'error', message: `Shop with id ${data.shop_id} is currently archived!` })

  // get user from shop.userID and validate
  _user = await UsersService.getUserByID(_shop.user_id)
  // this should not happen, shop should not be created with a wrong userID or without user
  if (!_user) return res.status(400).json({ status: 'error', message: 'Invalid User ID!' })
  // this should not happen, shop should also be archived
  if (_user.status === 'archived')
    return res.status(406).json({
      status: 'error',
      message: `User with id ${data.user_id} is currently archived!`,
    })

  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDocId
  if (!roles.editor && requestorDocId !== _shop.user_id)
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to create a product for another user.',
    })

  // get community from shop.communityID and validate
  _community = await CommunityService.getCommunityByID(_shop.community_id)
  // this should not happen, shop should not be created with a wrong communityID or without community
  if (!_community)
    return res.status(400).json({
      status: 'error',
      message: `Community of shop ${_shop.name} does not exist!`,
    })
  // this should not happen, shop should also be archived
  if (_community.archived) {
    return res.status(406).json({
      status: 'error',
      message: `Community of shop ${_shop.name} is currently archived!`,
    })
  }

  // check for correct number format
  if (!fieldIsNum(data.base_price))
    return res.status(400).json({ status: 'error', message: 'Base Price is not a type of number' })
  if (!fieldIsNum(data.quantity))
    return res.status(400).json({ status: 'error', message: 'Quantity is not a type of number' })

  let gallery
  if (data.gallery) {
    if (!Array.isArray(data.gallery))
      return res.status(400).json({
        status: 'error',
        message: 'Gallery is not an array of type object: {url: string, order: number}',
      })

    for (let [i, g] of data.gallery.entries()) {
      if (!g.url)
        return res
          .status(400)
          .json({ status: 'error', message: 'Missing gallery url for item ' + i })

      if (!fieldIsNum(g.order))
        return res
          .status(400)
          .json({ status: 'error', message: 'order is not a type of number for item ' + i })
    }

    gallery = data.gallery
  }

  const keywords = generateProductKeywords({
    name: data.name,
    product_category: data.product_category,
  })

  const _productData: any = {
    name: data.name,
    description: data.description,
    shop_id: data.shop_id,
    user_id: _shop.user_id,
    community_id: _shop.community_id,
    base_price: +data.base_price, // convert to number
    quantity: +data.quantity, // convert to number
    product_category: data.product_category,
    status: data.status || 'enabled',
    keywords,
    archived: false,
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  if (gallery) _productData.gallery = gallery

  const _newProduct = await ProductsService.createProduct(_productData)

  let _result = await _newProduct.get().then((doc) => doc.data())
  _result.id = _newProduct.id

  return res.status(200).json({ status: 'ok', data: _result })
}

export default createProduct

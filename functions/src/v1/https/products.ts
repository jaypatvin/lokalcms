import { getUserByID } from '../../service/users'
import * as ProductService from '../../service/products'
import { getCommunityByID } from '../../service/community'
import { getShopByID } from '../../service/shops'
import validateFields from '../../utils/validateFields'
import { generateProductKeywords } from '../../utils/generateKeywords'

const required_fields = [
  'name',
  'description',
  'shop_id',
  'base_price',
  'quantity',
  'product_category',
]

export const getProducts = async (req, res) => res.status(200).json({ status: 'ok_list' })

const stringIsNum = (input) => {
  if (typeof input != 'string') return false
  // parseFloat is for strings with white spaces
  return !isNaN(Number(input)) && !isNaN(parseFloat(input))
}

const fieldIsNum = (input) => {
  return typeof input == 'number' || stringIsNum(input)
}

export const createProduct = async (req, res) => {
  const data = req.body
  let _shop
  let _community
  let _user

  // shop ID validation
  _shop = await getShopByID(data.shop_id)
  if (!_shop) return res.status(400).json({ status: 'error', message: 'Invalid Shop ID!' })
  if (_shop.status === 'disabled')
    return res
      .status(406)
      .json({ status: 'error', message: `Shop with id ${data.shop_id} is currently archived!` })

  // get user from shop.userID and validate
  _user = await getUserByID(_shop.user_id)
  // this should not happen, shop should not be created with a wrong userID or without user
  if (!_user) return res.status(400).json({ status: 'error', message: 'Invalid User ID!' })
  // this should not happen, shop should also be archived
  if (_user.status === 'archived')
    return res.status(406).json({
      status: 'error',
      message: `User with id ${data.user_id} is currently archived!`,
    })

  // get community from shop.communityID and validate
  _community = await getCommunityByID(_shop.community_id)
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

  const error_fields = validateFields(data, required_fields)
  if (error_fields.length) {
    return res.json({ status: 'error', message: 'Required fields missing', error_fields })
  }

  // check for correct number format
  if (!fieldIsNum(data.base_price))
    return res.status(400).json({ status: 'error', message: 'Base Price is not a type of number' })
  if (!fieldIsNum(data.quantity))
    return res.status(400).json({ status: 'error', message: 'Quantity is not a type of number' })

  // gallery field should contain both url and order
  if (data.gallery) {
    if (!data.gallery['url'])
      return res.status(400).json({ status: 'error', message: 'Missing gallery url' })

    if (!fieldIsNum(data.gallery['order']))
      return res.status(400).json({ status: 'error', message: 'order is not a type of number' })
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
    gallery: { url: data.gallery['url'], order: +data.gallery['order'] }, // make sure that order is converted to number
    status: data.status || 'enabled',
    keywords,
  }

  const _newProduct = await ProductService.createProduct(_productData)

  let _result = await _newProduct.get().then((doc) => doc.data())
  _result.id = _newProduct.id

  return res.status(200).json({ status: 'ok', data: _result })
}

export const getProduct = async (req, res) => {
  const params = req.params
  let _product

  // check if product exists
  _product = await ProductService.getProductByID(params.id)
  if (!_product) return res.status(404).json({ status: 'error', message: 'Invalid Product Id!' })

  let _result = await _product.get().then((doc) => doc.data())

  res.status(200).json({ status: 'ok', data: _result })
}

export const updateProduct = async (req, res) => {
  const data = req.body

  if (!data.id) return res.status(400).json({ status: 'error', message: 'id is required!' })

  // check if product exists
  const product = await ProductService.getProductByID(data.id)
  if (!product) return res.status(404).json({ status: 'error', message: 'Invalid Product Id!' })

  const updateData: any = {}

  if (data.name || data.delivery_options || data.product_category) {
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
    return res.json({ status: 'error', message: 'no field for shop is provided' })

  const result = await ProductService.updateProduct(data.id, updateData)

  return res.json({ status: 'ok', data: result })
}

export const deleteProduct = async (req, res) => {
  res.json({ status: 'ok' })
}

import { Request, Response } from 'express'
import {
  ShopsService,
  CommunityService,
  ProductsService,
  CategoriesService,
} from '../../../service'
import validateFields from '../../../utils/validateFields'
import { generateProductKeywords } from '../../../utils/generateKeywords'
import { required_fields } from './index'
import { fieldIsNum } from '../../../utils/helpers'
import validateOperatingHours from '../../../utils/validateOperatingHours'
import generateSchedule from '../../../utils/generateSchedule'
import isScheduleDerived from '../../../utils/isScheduleDerived'

/**
 * @openapi
 * /v1/products:
 *   post:
 *     tags:
 *       - products
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will create a new product
 *       ### If the availability is not provided, the default will be the shop's operating_hours
 *       ### The availability must be derived from the shop's operating_hours
 *       # Examples
 *       ```
 *       {
 *         "name": "iPhone 6",
 *         "description": "second hand, slightly used",
 *         "shop_id": "document_id_of_shop",
 *         "base_price": 10000,
 *         "quantity": 100,
 *         "product_category": "gadgets",
 *         "gallery": [
 *           {
 *             "url": "url_of_the_iphone_image",
 *             "order": 1
 *           }
 *         ]
 *       }
 *       ```
 *
 *       ```
 *       {
 *         "name": "iPhone 6",
 *         "description": "second hand, slightly used",
 *         "shop_id": "document_id_of_shop",
 *         "base_price": 10000,
 *         "quantity": 100,
 *         "product_category": "gadgets",
 *         "gallery": [
 *           {
 *             "url": "url_of_the_iphone_image",
 *             "order": 1
 *           }
 *         ],
 *         "availability": {
 *           "start_time": "08:00 AM",
 *           "end_time": "04:00 PM",
 *           "start_dates": [
 *             "2021-05-03",
 *             "2021-05-05"
 *           ],
 *           "repeat_unit": 1,
 *           "repeat_type": "week",
 *           "unavailable_dates": [
 *             "2021-05-10"
 *           ],
 *           "custom_dates": [
 *             {
 *               "date": "2021-05-19",
 *               "end_time": "01:00 PM"
 *             }
 *           ]
 *         }
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
 *                 required: true
 *               shop_id:
 *                 type: string
 *                 required: true
 *               base_price:
 *                 type: number
 *                 required: true
 *               quantity:
 *                 type: number
 *                 required: true
 *               product_category:
 *                 type: string
 *                 required: true
 *               status:
 *                 type: string
 *               can_subscribe:
 *                 type: boolean
 *               gallery:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       required: true
 *                     order:
 *                       type: number
 *                       required: true
 *               availability:
 *                 type: object
 *                 properties:
 *                   start_time:
 *                     type: string
 *                   end_time:
 *                     type: string
 *                   start_dates:
 *                     type: array
 *                     required: true
 *                     items:
 *                       type: string
 *                   repeat_unit:
 *                     type: number
 *                     required: true
 *                   repeat_type:
 *                     type: string
 *                     required: true
 *                     description: This can also be like every first monday (1-mon), or third tuesday (3-tue) of the month
 *                     enum: [day, week, month, 1-mon, 2-wed, 3-tue, 2-fri, 4-sun, 5-thu, 1-sat]
 *                   unavailable_dates:
 *                     type: array
 *                     items:
 *                       type: string
 *                   custom_dates:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         date:
 *                           type: string
 *                           required: true
 *                         start_time:
 *                           type: string
 *                         end_time:
 *                           type: string
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
  const requestorDocId = res.locals.userDoc.id
  const userArchived = res.locals.userDoc.archived

  const error_fields = validateFields(data, required_fields)
  if (error_fields.length) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Required fields missing', error_fields })
  }

  const category = await CategoriesService.getCategoryById(data.product_category)
  if (!category) {
    return res
      .status(400)
      .json({ status: 'error', message: `Invalid category ${data.product_category}` })
  }

  // shop ID validation
  const shop = await ShopsService.getShopByID(data.shop_id)
  if (!shop) return res.status(400).json({ status: 'error', message: 'Invalid Shop ID!' })
  if (shop.status === 'disabled') {
    return res
      .status(400)
      .json({ status: 'error', message: `Shop with id ${data.shop_id} is currently disabled!` })
  }

  if (userArchived) {
    return res.status(400).json({
      status: 'error',
      message: `User with id ${data.user_id} is currently archived!`,
    })
  }

  // const roles = res.locals.userRoles
  // if (!roles.editor && requestorDocId !== shop.user_id) {
  //   return res.status(403).json({
  //     status: 'error',
  //     message: 'You do not have a permission to create a product for another user.',
  //   })
  // }

  // get community from shop.communityID and validate
  const community = await CommunityService.getCommunityByID(shop.community_id)
  // this should not happen, shop should not be created with a wrong communityID or without community
  if (!community) {
    return res.status(400).json({
      status: 'error',
      message: `Community of shop ${shop.name} does not exist!`,
    })
  }
  // this should not happen, shop should also be archived
  if (community.archived) {
    return res.status(400).json({
      status: 'error',
      message: `Community of shop ${shop.name} is currently archived!`,
    })
  }

  // check for correct number format
  if (!fieldIsNum(data.base_price)) {
    return res.status(400).json({ status: 'error', message: 'Base Price is not a type of number' })
  }
  if (!fieldIsNum(data.quantity)) {
    return res.status(400).json({ status: 'error', message: 'Quantity is not a type of number' })
  }

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

  const productData: any = {
    name: data.name,
    description: data.description,
    shop_id: data.shop_id,
    user_id: shop.user_id,
    community_id: shop.community_id,
    base_price: data.base_price,
    quantity: data.quantity,
    product_category: data.product_category,
    status: data.status || 'enabled',
    keywords,
    archived: false,
    updated_by: requestorDocId || '',
    updated_from: data.source || '',
    can_subscribe: data.can_subscribe ?? true,
  }

  if (data.availability) {
    const validation = validateOperatingHours(data.availability)
    if (!validation.valid) {
      return res.status(400).json({
        status: 'error',
        ...validation,
      })
    }

    const {
      start_time,
      end_time,
      start_dates,
      repeat_unit,
      repeat_type,
      unavailable_dates,
      custom_dates,
    } = data.availability

    productData.availability = {
      start_time,
      end_time,
      start_dates,
      repeat_type,
      repeat_unit,
      schedule: generateSchedule({
        start_time,
        end_time,
        start_dates,
        repeat_type,
        repeat_unit,
        unavailable_dates,
        custom_dates,
      }),
    }
    if (!isScheduleDerived(productData.availability, shop.operating_hours)) {
      return res.status(400).json({
        status: 'error',
        message: 'The product availability must be derived from the shop schedule.',
      })
    }
  } else if (shop.operating_hours) {
    productData.availability = shop.operating_hours
  }

  if (gallery) productData.gallery = gallery

  const result = await ProductsService.createProduct(productData)

  return res.status(200).json({ status: 'ok', data: result })
}

export default createProduct

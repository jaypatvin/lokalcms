import { RequestHandler } from 'express'
import { ShopsService, ProductsService, CategoriesService } from '../../../service'
import { isScheduleDerived } from '../../../utils/validations'
import {
  ErrorCode,
  generateError,
  generateNotFoundError,
  generateProductKeywords,
  generateSchedule,
} from '../../../utils/generators'
import { ProductCreateData } from '../../../models/Product'

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
const createProduct: RequestHandler = async (req, res) => {
  const data = req.body
  const requestorDocId = res.locals.userDoc.id
  const userArchived = res.locals.userDoc.archived

  const category = await CategoriesService.findById(data.product_category)
  if (!category) {
    throw generateNotFoundError(ErrorCode.ProductApiError, 'Category', data.product_category)
  }

  const shop = await ShopsService.findById(data.shop_id)
  if (!shop) {
    throw generateNotFoundError(ErrorCode.ProductApiError, 'Shop', data.shop_id)
  }
  if (shop.status === 'disabled') {
    throw generateError(ErrorCode.ProductApiError, {
      message: `Shop with id ${data.shop_id} is currently disabled`,
    })
  }

  if (userArchived) {
    throw generateError(ErrorCode.ProductApiError, {
      message: `User with id ${data.user_id} is currently disabled`,
    })
  }

  const roles = res.locals.userRoles
  if (!roles.editor && requestorDocId !== shop.user_id) {
    throw generateError(ErrorCode.ProductApiError, {
      message: 'User does not have a permission to create a product for another user',
    })
  }

  const keywords = generateProductKeywords({
    name: data.name,
    product_category: data.product_category,
  })

  let availability = shop.operating_hours

  if (data.availability) {
    const {
      start_time,
      end_time,
      start_dates,
      repeat_unit,
      repeat_type,
      unavailable_dates,
      custom_dates,
    } = data.availability

    availability = {
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
    if (!isScheduleDerived(availability, shop.operating_hours)) {
      throw generateError(ErrorCode.ProductApiError, {
        message: 'The product availability must be derived from the shop schedule',
      })
    }
  }

  const productData: ProductCreateData = {
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
    availability,
  }

  if (data.gallery) productData.gallery = data.gallery

  const result = await ProductsService.create(productData)

  return res.status(200).json({ status: 'ok', data: result })
}

export default createProduct

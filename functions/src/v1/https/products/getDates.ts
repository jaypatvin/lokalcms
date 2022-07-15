import dayjs from 'dayjs'
import { RequestHandler } from 'express'
import { isString } from 'lodash'
import { ProductsService } from '../../../service'
import {
  ErrorCode,
  generateDatesFromSchedule,
  generateError,
  generateNotFoundError,
} from '../../../utils/generators'
import { dateFormat } from '../../../utils/helpers'

/**
 * @openapi
 * /v1/products/{productId}/getDates:
 *   get:
 *     tags:
 *       - products
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ## Return the available dates based on the schedule and within the given date range
 *       ### Default start date is today, and default end date is today + 45 days
 *       # Examples
 *       ```
 *       /v1/products/{productId}/getDates?start_date=2021-09-30&end_date=2021-10-25
 *       /v1/products/{productId}/getDates?end_date=2021-10-25
 *       /v1/products/{productId}/getDates?start_date=2021-09-30
 *       ```
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: document id of the product
 *         schema:
 *           type: string
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *         description: Will default to the current date. Must be in format YYYY-MM-DD.
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *         description: Will default to the current date + 45 days. Must be in format YYYY-MM-DD
 *     responses:
 *       200:
 *         description: array of dates in YYYY-MM-DD format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 */
const getDates: RequestHandler = async (req, res) => {
  const { productId } = req.params
  const { start_date, end_date }: any = req.query

  if (start_date) {
    if (!isString(start_date) || !dateFormat.test(start_date)) {
      throw generateError(ErrorCode.ProductApiError, {
        message: `Start date "${start_date}" is not a valid format. Please follow format "YYYY-MM-DD"`,
      })
    }
    if (!dayjs(start_date).isValid()) {
      throw generateError(ErrorCode.ProductApiError, {
        message: `Start date "${start_date}" is not a valid date"`,
      })
    }
  }

  if (end_date) {
    if (!isString(end_date) || !dateFormat.test(end_date)) {
      throw generateError(ErrorCode.ProductApiError, {
        message: `End date "${start_date}" is not a valid format. Please follow format "YYYY-MM-DD"`,
      })
    }
    if (!dayjs(end_date).isValid()) {
      throw generateError(ErrorCode.ProductApiError, {
        message: `End date "${start_date}" is not a valid date"`,
      })
    }
  }

  if (start_date && end_date) {
    if (end_date < start_date) {
      throw generateError(ErrorCode.ProductApiError, {
        message: `End date "${end_date}" cannot be before the start date "${start_date}"`,
      })
    }
  }

  // check if product exists
  const product = await ProductsService.findById(productId)
  if (!product) {
    throw generateNotFoundError(ErrorCode.ProductApiError, 'Product', productId)
  }

  const availability = product.availability
  const output = generateDatesFromSchedule(availability, { start_date, end_date })

  return res.status(200).json({ status: 'ok', data: output })
}

export default getDates

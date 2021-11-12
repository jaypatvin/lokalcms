import dayjs from 'dayjs'
import React from 'react'
import SortButton from '../../components/buttons/SortButton'
import { formatToPeso } from '../../utils/helper'

type Props = {
  data: any
}

const CommunityOrdersTable = ({ data }: Props) => {
  return (
    <div className="table-wrapper w-full">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th key="products">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Products"
                  showSortIcons={false}
                />
              </th>
              <th key="seller">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Seller"
                  showSortIcons={false}
                />
              </th>
              <th key="buyer">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Buyer"
                  showSortIcons={false}
                />
              </th>
              <th key="delivery_details">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Delivery Details"
                  showSortIcons={false}
                />
              </th>
              <th key="status">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Status"
                  showSortIcons={false}
                />
              </th>
              <th key="created_at">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Created At"
                  showSortIcons={false}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d: any) => {
              const created_at = d.created_at ? dayjs(d.created_at.toDate()).fromNow() : '-'
              let totalPrice = 0
              let totalItems = 0
              return (
                <tr>
                  <td>
                    {d.products.slice(0, 2).map((product: any) => {
                      const subTotalPrice = product.quantity * product.product_price
                      totalPrice += subTotalPrice
                      totalItems += product.quantity
                      return (
                        <div className="border-b-1 mb-2 py-2 flex items-center">
                          <div className="w-12 mr-2">
                            {product.product_image ? (
                              <img
                                src={product.product_image}
                                alt={product.product_name}
                                className="max-w-12 max-h-12"
                              />
                            ) : (
                              ''
                            )}
                          </div>
                          <p>
                            {`${product.product_name} (${product.quantity}) = ${formatToPeso(
                              subTotalPrice
                            )}`}{' '}
                            {product.instruction ? (
                              <span className="block">
                                <i>Instruction: {product.instruction}</i>
                              </span>
                            ) : (
                              ''
                            )}
                          </p>
                        </div>
                      )
                    })}
                    {d.products.length > 2 ? <p>And {d.products.length - 2} more</p> : ''}
                    <p className="font-bold">{totalItems} items</p>
                    <p>Total Price: {formatToPeso(totalPrice)}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.seller_email}</p>
                    <p className="text-gray-900 whitespace-no-wrap">Shop: {d.shop_name}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.buyer_email}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.delivery_option}</p>
                    <p className="text-gray-900 whitespace-no-wrap">
                      {dayjs(d.delivery_date.toDate()).format('YYYY-MM-DD h:mm a')}
                    </p>
                    <p className="text-gray-900 whitespace-no-wrap">
                      {d.delivery_address.subdivision}, {d.delivery_address.barangay},{' '}
                      {d.delivery_address.city}, {d.delivery_address.state},{' '}
                      {d.delivery_address.country}, {d.delivery_address.zip_code}
                    </p>
                  </td>
                  <td>
                    {d.is_paid ? (
                      <span className="rounded p-1 bg-primary-500 text-white">Paid</span>
                    ) : (
                      <span className="rounded p-1 bg-secondary-500 text-white">Not Paid</span>
                    )}
                    <p>{d.payment_method}</p>
                    {d.instruction ? (
                      <p className="text-gray-900 whitespace-no-wrap">
                        Instruction: {d.instruction}
                      </p>
                    ) : (
                      ''
                    )}
                    {d.cancellation_reason || d.decline_reason ? (
                      <p className="text-danger-500 whitespace-no-wrap">
                        {d.cancellation_reason || d.decline_reason}
                      </p>
                    ) : (
                      ''
                    )}
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{created_at}</p>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CommunityOrdersTable

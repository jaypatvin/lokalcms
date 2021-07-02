import dayjs from 'dayjs'
import React, { useState } from 'react'
import { buttonIcons } from '../../components/buttons/theme'
import { formatToPeso } from '../../utils/helper'

type Props = {
  order: any
  orderStatusMap: any
}

const OrderDetails = ({ order, orderStatusMap }: Props) => {
  let totalPrice = 0
  let totalItems = 0
  const [showMore, setShowMore] = useState(false)

  return (
    <div className="flex p-3 pb-5 mb-1 border-1 justify-between shadow-md w-full relative hover:bg-primary-50">
      <button
        className="absolute bottom-0 left-0 text-2xl w-full flex justify-center"
        onClick={() => setShowMore(!showMore)}
      >
        {buttonIcons[showMore ? 'caretUpLg' : 'caretDownLg']}
      </button>
      <div className="w-1/4">
        <p>ID: {order.id}</p>
        <p>Created: {dayjs(order.created_at.toDate()).format('YYYY-MM-DD h:mm a')}</p>
        <p>
          <strong>Shop: {order.shop_name}</strong>
        </p>
        {showMore && (
          <>
            <p className="italic">{order.shop_description}</p>
            {order.shop_image ? (
              <img
                src={order.shop_image}
                alt={order.shop_name}
                className="max-w-full max-h-40 m-2"
              />
            ) : (
              ''
            )}
          </>
        )}
      </div>
      <div className="w-1/4">
        {order.products.map((product: any) => {
          const subTotalPrice = product.quantity * product.product_price
          totalPrice += subTotalPrice
          totalItems += product.quantity
          return (
            showMore && (
              <div className="border-b-1 mb-2 py-2 flex items-center">
                <div className="w-24 mr-2">
                  {product.product_image ? (
                    <img
                      src={product.product_image}
                      alt={product.product_name}
                      className="max-w-24 max-h-24"
                    />
                  ) : (
                    ''
                  )}
                </div>
                <p>
                  {`${product.product_name} (${product.quantity}) = ${formatToPeso(subTotalPrice)}`}{' '}
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
          )
        })}
        {!showMore && <p className="font-bold">{totalItems} items</p>}
        <p>Total Price: {formatToPeso(totalPrice)}</p>
      </div>
      <div className="w-1/4">
        <p>Delivery Option: {order.delivery_option}</p>
        <p>Delivery Date: {dayjs(order.delivery_date.toDate()).format('YYYY-MM-DD h:mm a')}</p>
        {order.delivered_date ? (
          <p>Delivered Date: {dayjs(order.delivered_date.toDate()).format('YYYY-MM-DD h:mm a')}</p>
        ) : (
          ''
        )}
        {showMore && (
          <p>
            Delivery Address: {order.delivery_address.subdivision},{' '}
            {order.delivery_address.barangay}, {order.delivery_address.city},{' '}
            {order.delivery_address.state}, {order.delivery_address.country},{' '}
            {order.delivery_address.zip_code}
          </p>
        )}
      </div>
      <div className="w-1/4">
        <p>
          {order.is_paid ? (
            <span className="rounded p-1 bg-primary-500 text-white">Paid</span>
          ) : (
            <span className="rounded p-1 bg-secondary-500 text-white">Not Paid</span>
          )}
        </p>
        {order.proof_of_payment && showMore ? (
          <>
            <p className="italic">Proof of payment:</p>
            <img
              src={order.proof_of_payment}
              alt="Payment method"
              className="max-w-full max-h-40"
            />
          </>
        ) : (
          ''
        )}
        <p>Payment method: {order.payment_method || '--'}</p>
        <p>Buyer Status: {orderStatusMap[order.status_code]?.buyer_status || '--'}</p>
        <p>Seller Status: {orderStatusMap[order.status_code]?.seller_status || '--'}</p>
        {order.instruction && showMore ? (
          <p className="italic">Instruction: {order.instruction}</p>
        ) : (
          ''
        )}
      </div>
    </div>
  )
}

export default OrderDetails

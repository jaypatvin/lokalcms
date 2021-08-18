import dayjs from 'dayjs'
import { useState } from 'react'
import { buttonIcons } from '../../components/buttons/theme'
import { formatToPeso } from '../../utils/helper'

type Props = {
  subscriptionPlan: any
}

const ProductSubscriptionPlanDetails = ({ subscriptionPlan }: Props) => {
  const [showMore, setShowMore] = useState(false)

  return (
    <>
      <div className="flex p-3 pb-5 mb-1 border-1 justify-between shadow-md w-full relative hover:bg-primary-50">
        <button
          className="absolute bottom-0 left-0 text-2xl w-full flex justify-center"
          onClick={() => setShowMore(!showMore)}
        >
          {buttonIcons[showMore ? 'caretUpLg' : 'caretDownLg']}
        </button>
        <div className="w-1/4">
          <p>ID: {subscriptionPlan.id}</p>
          <p>Created: {dayjs(subscriptionPlan.created_at.toDate()).format('YYYY-MM-DD h:mm a')}</p>
          <p>Buyer: {subscriptionPlan.buyer_email}</p>
          <p>Seller: {subscriptionPlan.seller_email}</p>
          <p>
            <strong>Shop: {subscriptionPlan.shop.name}</strong>
          </p>
          {showMore && (
            <>
              <p className="italic">{subscriptionPlan.shop.description}</p>
              {subscriptionPlan.shop_image ? (
                <img
                  src={subscriptionPlan.shop.image}
                  alt={subscriptionPlan.shop.name}
                  className="max-w-full max-h-40 m-2"
                />
              ) : (
                ''
              )}
            </>
          )}
        </div>
        <div className="w-1/4">
          {showMore && (
            <div className="border-b-1 mb-2 py-2 flex items-center">
              <div className="w-24 mr-2">
                {subscriptionPlan.product.image ? (
                  <img
                    src={subscriptionPlan.product.image}
                    alt={subscriptionPlan.product.name}
                    className="max-w-24 max-h-24"
                  />
                ) : (
                  ''
                )}
              </div>
              <p>
                {`${subscriptionPlan.product.name} (${subscriptionPlan.quantity}) = ${formatToPeso(
                  subscriptionPlan.product.price * subscriptionPlan.quantity
                )}`}{' '}
              </p>
            </div>
          )}
          {!showMore && <p className="font-bold">{subscriptionPlan.quantity} items</p>}
          <p>
            Total Price: {formatToPeso(subscriptionPlan.product.price * subscriptionPlan.quantity)}
          </p>
        </div>
        <div className="w-1/4">
          <p>The plan</p>
        </div>
        <div className="w-1/4">
          <p>Payment method: {subscriptionPlan.payment_method || '--'}</p>
          {subscriptionPlan.instruction && showMore ? (
            <p className="italic">Instruction: {subscriptionPlan.instruction}</p>
          ) : (
            ''
          )}
        </div>
      </div>
    </>
  )
}

export default ProductSubscriptionPlanDetails

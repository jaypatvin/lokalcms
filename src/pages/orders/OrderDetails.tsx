import dayjs from 'dayjs'
import React, { ChangeEvent, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { buttonIcons } from '../../components/buttons/theme'
import { API_URL } from '../../config/variables'
import { useAuth } from '../../contexts/AuthContext'
import useOuterClick from '../../customHooks/useOuterClick'
import Modal, { TextModal } from '../../components/modals'
import { formatToPeso } from '../../utils/helper'
import { Checkbox } from '../../components/inputs'
import { storage } from '../../services/firebase'
import { OrderData, OrderStatusMap } from './OrdersPage'

type Props = {
  order: OrderData
  orderStatusMap: OrderStatusMap
}

type ProofOfPayment = {
  url?: string
  file: File
  preview: string
}

type ProgressData = {
  buyer_id?: string
  seller_id?: string
  payment_method?: 'cod' | 'bank'
  proof_of_payment?: string
  reason?: string
}

const OrderDetails = ({ order, orderStatusMap }: Props) => {
  const { firebaseToken } = useAuth()

  let totalPrice = 0
  let totalItems = 0
  const [loading, setLoading] = useState(false)
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)
  const [proofOfPayment, setProofOfPayment] = useState<ProofOfPayment>()
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank'>('bank')
  const [modalType, setModalType] = useState<'cancel' | 'decline' | 'pay'>()
  const [showMore, setShowMore] = useState(false)
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const optionsRef = useOuterClick(() => setIsOptionsOpen(false))

  const statusCodeAPI: { [x: number]: string } = {
    10: 'cancel',
    20: 'decline',
    100: 'confirm',
    200: 'pay',
    300: 'confirmPayment',
    400: 'shipOut',
    500: 'receive',
  }

  const statusCodeAction: { [x: number]: string } = {
    100: 'Confirm',
    200: 'Pay',
    300: 'Confirm Payment',
    400: 'Ship Out',
    500: 'Receive',
  }

  const callApiProgress = async (order: OrderData, data: ProgressData = {}, method?: string) => {
    let res = null
    setLoading(true)
    if (API_URL && firebaseToken) {
      const statusCode = parseInt(order.status_code as string)
      const apiMethod = method || statusCodeAPI[statusCode]
      let url = `${API_URL}/orders/${order.id}/${apiMethod}`
      try {
        res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${firebaseToken}`,
          },
          method: 'PUT',
          body: JSON.stringify({
            ...data,
            source: 'cms',
          }),
        })
        res = await res.json()
      } catch (error) {
        console.error(error)
      }
    } else {
      console.error('environment variable for the api does not exist.')
    }
    console.log('res', res)
    setLoading(false)
    setShowReasonModal(false)
    setShowPayModal(false)
    return res
  }

  const onProgress = async () => {
    switch (parseInt(order.status_code as string)) {
      case 100: // Waiting for Confirmation
        await callApiProgress(order, { seller_id: order.seller_id })
        break
      case 200: // Payment
        setShowPayModal(true)
        break
      case 300: // Payment Confirmation
      case 400: // Shipping Out
        await callApiProgress(order, { seller_id: order.seller_id })
        break
      case 500: // To Receive
        await callApiProgress(order, { buyer_id: order.buyer_id })
        break
      case 10: // Cancelled by Buyer
      case 20: // Declined by Seller
      case 600: // Finished
      default:
        // do nothing
        break
    }
    setLoading(false)
  }

  const payOrder = async () => {
    const data = { buyer_id: order.buyer_id, proof_of_payment: '', payment_method: paymentMethod }
    if (paymentMethod !== 'cod') {
      if (!proofOfPayment) return
      try {
        const uuid = uuidv4()
        const upload = await storage
          .ref(`/images/orders/proof_of_payments/${order.id}_${uuid}`)
          .put(proofOfPayment.file)
        data.proof_of_payment = await upload.ref.getDownloadURL()
      } catch (error) {
        console.error(error)
        return
      }
    }
    await callApiProgress(order, data)
  }

  const cancelOrder = async (reason: string) => {
    const data: ProgressData = { buyer_id: order.buyer_id }
    if (reason) data.reason = reason
    await callApiProgress(order, data, 'cancel')
  }

  const declineOrder = async (reason: string) => {
    const data: ProgressData = { seller_id: order.seller_id }
    if (reason) data.reason = reason
    await callApiProgress(order, data, 'decline')
  }

  const fileChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const newProofOfPayment = {
      file: e.target.files[0],
      preview: URL.createObjectURL(e.target.files[0]),
    }
    setProofOfPayment(newProofOfPayment)
  }

  const canChangeStatus =
    parseInt(order.status_code as string) < 600 && parseInt(order.status_code as string) >= 100
  const canCancelOrDecline =
    parseInt(order.status_code as string) < 400 && parseInt(order.status_code as string) >= 100

  return (
    <>
      <TextModal
        title="Reason"
        isOpen={showReasonModal}
        setIsOpen={setShowReasonModal}
        onSave={(reason: string) => {
          if (modalType === 'cancel') cancelOrder(reason)
          if (modalType === 'decline') declineOrder(reason)
          return
        }}
      />
      <Modal title="Payment" isOpen={showPayModal} setIsOpen={setShowPayModal} onSave={payOrder}>
        <Checkbox
          label="COD"
          onChange={(e) => setPaymentMethod(e.target.checked ? 'cod' : 'bank')}
          noMargin
        />
        {paymentMethod === 'bank' && (
          <>
            <label htmlFor="proof_of_payment" className="text-primary-600 cursor-pointer">
              Proof of Payment
            </label>
            <input
              id="proof_of_payment"
              type="file"
              name="proof of payment"
              onChange={fileChangeHandler}
              className="hidden"
            />
            {proofOfPayment && (
              <img className="w-96 z-10" src={proofOfPayment.preview} alt="Proof of Payment" />
            )}
          </>
        )}
      </Modal>
      <div className="flex p-3 pb-5 mb-1 border-1 justify-between shadow-md w-full relative hover:bg-primary-50">
        <div ref={optionsRef} className="absolute right-0 top-2">
          <button
            disabled={loading}
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            type="button"
            className="inline-block text-gray-500 hover:text-gray-700"
          >
            <svg className="inline-block h-6 w-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm-2 6a2 2 0 104 0 2 2 0 00-4 0z" />
            </svg>
          </button>
          {isOptionsOpen && canChangeStatus && (
            <div className="absolute top-0 right-full shadow w-36 bg-white z-10">
              <button
                onClick={() => {
                  onProgress()
                  setIsOptionsOpen(false)
                }}
                className="block w-full p-2 hover:bg-primary-400 hover:text-white"
              >
                {statusCodeAction[order.status_code as number]}
              </button>
              {canCancelOrDecline && (
                <>
                  <button
                    onClick={() => {
                      setModalType('cancel')
                      setShowReasonModal(true)
                      setIsOptionsOpen(false)
                    }}
                    className="block w-full p-2 hover:bg-danger-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setModalType('decline')
                      setShowReasonModal(true)
                      setIsOptionsOpen(false)
                    }}
                    className="block w-full p-2 hover:bg-danger-400 hover:text-white"
                  >
                    Decline
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <button
          className="absolute bottom-0 left-0 text-2xl w-full flex justify-center"
          onClick={() => setShowMore(!showMore)}
        >
          {buttonIcons[showMore ? 'caretUpLg' : 'caretDownLg']}
        </button>
        <div className="w-1/4">
          <p>ID: {order.id}</p>
          <p>Created: {dayjs(order.created_at.toDate()).format('YYYY-MM-DD h:mm a')}</p>
          <p>Buyer: {order.buyer_email}</p>
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
          {order.products.map((product) => {
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
            )
          })}
          {!showMore && <p className="font-bold">{totalItems} items</p>}
          <p>Total Price: {formatToPeso(totalPrice)}</p>
        </div>
        <div className="w-1/4">
          <p>Delivery Option: {order.delivery_option}</p>
          <p>Delivery Date: {dayjs(order.delivery_date.toDate()).format('YYYY-MM-DD h:mm a')}</p>
          {order.delivered_date ? (
            <p>
              Delivered Date: {dayjs(order.delivered_date.toDate()).format('YYYY-MM-DD h:mm a')}
            </p>
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
          {(order.cancellation_reason || order.decline_reason) && showMore ? (
            <p className="italic">Reason: {order.cancellation_reason || order.decline_reason}</p>
          ) : (
            ''
          )}
        </div>
      </div>
    </>
  )
}

export default OrderDetails

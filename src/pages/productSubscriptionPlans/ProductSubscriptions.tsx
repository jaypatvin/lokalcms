import React, { useEffect, useState } from 'react'
import { Button } from '../../components/buttons'
import SortButton from '../../components/buttons/SortButton'
import Dropdown from '../../components/Dropdown'
import ViewModal from '../../components/modals/ViewModal'
import { fetchOrderByProductSubscription } from '../../services/orders'
import { getProductSubscriptions } from '../../services/productSubscriptions'
import { LimitType } from '../../utils/types'

type Props = {
  subscriptionPlan: any
  show: boolean
  onClose: () => void
}

const ProductSubscriptions = ({ subscriptionPlan, show, onClose }: Props) => {
  const [productSubscriptions, setProductSubscriptions] = useState<any>([])

  const [limit, setLimit] = useState<LimitType>(10)
  const [pageNum, setPageNum] = useState(1)
  const [dataRef, setDataRef] = useState<any>()
  const [firstDataOnList, setFirstDataOnList] = useState<any>()
  const [lastDataOnList, setLastDataOnList] = useState<any>()
  const [isLastPage, setIsLastPage] = useState(false)

  const [productSubscriptionPlansSnapshot, setProductSubscriptionPlansSnapshot] =
    useState<{ unsubscribe: () => void }>()

  useEffect(() => {
    getProductSubscriptionsByPlanId()
  }, [subscriptionPlan, limit])

  const onCloseViewSubscriptions = () => {
    setProductSubscriptions([])
    onClose()
  }

  const setupDataList = async (docs: any) => {
    const data = []
    for (let productSubscription of docs) {
      const relatedOrder = await fetchOrderByProductSubscription(productSubscription.id)
      const orderData = relatedOrder.empty
        ? null
        : { ...relatedOrder.docs[0].data(), id: relatedOrder.docs[0].id }
      data.push({
        ...productSubscription.data(),
        id: productSubscription.id,
        order: orderData,
      })
    }
    setProductSubscriptions(data)
    setLastDataOnList(docs[docs.length - 1])
    setFirstDataOnList(docs[0])
  }

  const getProductSubscriptionsByPlanId = async () => {
    if (!subscriptionPlan) return
    const dataRef = getProductSubscriptions({
      product_subscription_plan_id: subscriptionPlan.id,
      limit,
    })
    if (productSubscriptionPlansSnapshot && productSubscriptionPlansSnapshot.unsubscribe)
      productSubscriptionPlansSnapshot.unsubscribe() // unsubscribe current listener
    const newUnsubscribe = dataRef.onSnapshot(async (snapshot) => {
      setupDataList(snapshot.docs)
    })
    setProductSubscriptionPlansSnapshot({ unsubscribe: newUnsubscribe })
    setDataRef(dataRef)
    setPageNum(1)
    setIsLastPage(false)
  }

  const onNextPage = () => {
    if (dataRef && lastDataOnList && !isLastPage) {
      const newDataRef = dataRef.startAfter(lastDataOnList).limit(limit)
      newDataRef.onSnapshot(async (snapshot: any) => {
        if (snapshot.docs.length) {
          setupDataList(snapshot.docs)
          setPageNum(pageNum + 1)
        } else if (!isLastPage) {
          setIsLastPage(true)
        }
      })
    }
  }

  const onPreviousPage = () => {
    const newPageNum = pageNum - 1
    if (dataRef && firstDataOnList && newPageNum > 0) {
      const newDataRef = dataRef.endBefore(firstDataOnList).limitToLast(limit)
      newDataRef.onSnapshot(async (snapshot: any) => {
        setupDataList(snapshot.docs)
      })
    }
    setIsLastPage(false)
    setPageNum(Math.max(1, newPageNum))
  }

  return (
    <ViewModal
      title={`Subscriptions for ${subscriptionPlan?.product.name}`}
      isOpen={show}
      close={onCloseViewSubscriptions}
    >
      <p>Shop: {subscriptionPlan?.shop.name}</p>
      <p className="text-secondary-600 text-xs">Seller: {subscriptionPlan?.seller_email}</p>
      <p className="text-secondary-600 text-xs">Buyer: {subscriptionPlan?.buyer_email}</p>
      {productSubscriptions.length === 0 ? (
        <p className="mt-5">No subscriptions created yet</p>
      ) : (
        <>
          <div className="flex align-middle mt-2">
            <div className="flex items-center">
              Show:{' '}
              <Dropdown
                className="ml-1 z-10"
                simpleOptions={[10, 25, 50, 100]}
                size="small"
                onSelect={(option: any) => setLimit(option.value)}
                currentValue={limit}
              />
            </div>
            <Button
              className="ml-5"
              icon="arrowBack"
              size="small"
              color={pageNum === 1 ? 'secondary' : 'primary'}
              onClick={onPreviousPage}
            />
            <Button
              className="ml-3"
              icon="arrowForward"
              size="small"
              color={isLastPage ? 'secondary' : 'primary'}
              onClick={onNextPage}
            />
          </div>
          <div className="table-wrapper w-full overflow-x-auto">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th key="date">
                      <SortButton
                        className="text-xs uppercase font-bold"
                        label="Date"
                        showSortIcons={false}
                      />
                    </th>
                    <th key="quantity">
                      <SortButton
                        className="text-xs uppercase font-bold"
                        label="Quantity"
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
                    <th key="order">
                      <SortButton
                        className="text-xs uppercase font-bold"
                        label="Order ID"
                        showSortIcons={false}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {productSubscriptions.map((data: any) => (
                    <tr>
                      <td>
                        <p className="text-gray-900 whitespace-no-wrap">{data.date_string}</p>
                      </td>
                      <td>
                        <p className="text-gray-900 whitespace-no-wrap">{data.quantity}</p>
                      </td>
                      <td>
                        <p className="text-gray-900 whitespace-no-wrap">
                          {data.confirmed_by_buyer
                            ? 'Confirmed by Buyer'
                            : 'No confirmation from Buyer'}
                        </p>
                        <p className="text-gray-900 whitespace-no-wrap">
                          {data.confirmed_by_seller
                            ? 'Confirmed by Seller'
                            : 'No confirmation from Seller'}
                        </p>
                        {!!data.skip && (
                          <p className="whitespace-no-wrap text-danger-500">Skipped</p>
                        )}
                      </td>
                      <td>
                        <p className="text-gray-900 whitespace-no-wrap">
                          {data.order ? data.order.id : '--'}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </ViewModal>
  )
}

export default ProductSubscriptions

import dayjs from 'dayjs'
import React, { ChangeEventHandler, useRef, useState } from 'react'
import ReactLoading from 'react-loading'
import { TextField } from '../../components/inputs'
import useOuterClick from '../../customHooks/useOuterClick'
import { getCommunities } from '../../services/community'
import { getOrders } from '../../services/orders'

const pesoFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'PHP',
})

const OrdersPage = ({}) => {
  const [community, setCommunity] = useState<any>()
  const [showCommunitySearchResult, setShowCommunitySearchResult] = useState(false)
  const communitySearchResultRef = useOuterClick(() => setShowCommunitySearchResult(false))
  const [communitySearchText, setCommunitySearchText] = useState('')
  const [communitySearchResult, setCommunitySearchResult] = useState<any>([])
  const [orders, setOrders] = useState<any[]>([])
  const [ordersSnapshot, setOrdersSnapshot] = useState<{ unsubscribe: () => void }>()
  const [loading, setLoading] = useState(false)

  const [statusCode, setStatusCode] = useState<number>()
  const [productId, setProductId] = useState<string>()
  const [shopId, setShopId] = useState<string>()

  const communitySearchHandler: ChangeEventHandler<HTMLInputElement> = async (e) => {
    setCommunitySearchText(e.target.value)
    if (e.target.value.length > 2) {
      const communitiesRef = getCommunities({ search: e.target.value })
      const result = await communitiesRef.get()
      const communities = result.docs.map((doc) => {
        const data = doc.data()
        return { ...data, id: doc.id }
      })
      setCommunitySearchResult(communities)
      setShowCommunitySearchResult(communities.length > 0)
    } else {
      setShowCommunitySearchResult(false)
      setCommunitySearchResult([])
    }
  }

  const communitySelectHandler = (community: any) => {
    setShowCommunitySearchResult(false)
    setCommunitySearchResult([])
    setCommunity(community)
    setCommunitySearchText(community.name)
    getCommunityOrders(community)
  }

  const getCommunityOrders = async (community: any) => {
    if (!community) return
    setLoading(true)
    const ordersRef = getOrders({
      community_id: community.id,
      product_id: productId,
      shop_id: shopId,
      status_code: statusCode,
    })
    if (ordersSnapshot && ordersSnapshot.unsubscribe) ordersSnapshot.unsubscribe() // unsubscribe current listener
    const newUnsubscribe = ordersRef.onSnapshot(async (snapshot) => {
      const newOrders = snapshot.docs.map((doc): any => ({
        id: doc.id,
        ...doc.data(),
      }))
      setOrders(newOrders)
    })
    setOrdersSnapshot({ unsubscribe: newUnsubscribe })
    setLoading(false)
  }

  return (
    <>
      <h2 className="text-2xl font-semibold leading-tight">Orders</h2>
      <div className="flex items-center my-5 w-96">
        <div ref={communitySearchResultRef} className="relative">
          <TextField
            label="Community"
            type="text"
            size="small"
            placeholder="Search"
            onChange={communitySearchHandler}
            value={communitySearchText}
            onFocus={() => setShowCommunitySearchResult(communitySearchResult.length > 0)}
          />
          {showCommunitySearchResult && communitySearchResult.length > 0 && (
            <div className="absolute top-full left-0 w-72 bg-white shadow z-10">
              {communitySearchResult.map((community: any) => (
                <button
                  className="w-full p-1 hover:bg-gray-200 block text-left"
                  key={community.id}
                  onClick={() => communitySelectHandler(community)}
                >
                  {community.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex h-2/3-screen">
        {loading ? (
          <div className="h-96 w-full relative">
            <ReactLoading
              type="spin"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              color="gray"
            />
          </div>
        ) : (
          <div className="h-full w-full overflow-y-auto">
            {orders.map((order) => {
              let totalPrice = 0
              return (
                <div className="flex p-3 border-1 justify-between shadow-md w-full">
                  <div className="w-1/3">
                    <p>ID: {order.id}</p>
                    <p>
                      <strong>Shop: {order.shop_name}</strong>
                    </p>
                    <i>{order.shop_description}</i>
                    {order.shop_image ? (
                      <img
                        src={order.shop_image}
                        alt={order.shop_name}
                        className="max-w-full max-h-40 m-2"
                      />
                    ) : (
                      ''
                    )}
                    {order.instruction ? <i>Instruction: {order.instruction}</i> : ''}
                  </div>
                  <div className="w-1/3">
                    {order.products.map((product: any) => {
                      const subTotalPrice = product.quantity * product.product_price
                      totalPrice += subTotalPrice
                      return (
                        <div className="border-b-1 mb-2 py-2 flex items-center">
                          <div className="w-24">
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
                            {`${product.product_name} (${
                              product.quantity
                            }) = ${pesoFormatter.format(subTotalPrice)}`}{' '}
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
                    <p>Total Price: {pesoFormatter.format(totalPrice)}</p>
                  </div>
                  <div className="w-1/3">
                    <p>Delivery Option: {order.delivery_option}</p>
                    <p>
                      Delivery Date:{' '}
                      {dayjs(order.delivery_date.toDate()).format('YYYY-MM-DD h:mm a')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

export default OrdersPage

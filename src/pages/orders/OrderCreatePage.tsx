import React, { ChangeEventHandler, useEffect, useState } from 'react'
import ReactLoading from 'react-loading'
import ReactCalendar from 'react-calendar'
import { TextField } from '../../components/inputs'
import useOuterClick from '../../customHooks/useOuterClick'
import { getCommunities } from '../../services/community'
import { getShopsByCommunity } from '../../services/shops'
import { getProductsByShop } from '../../services/products'
import { getUsers } from '../../services/users'
import { formatToPeso } from '../../utils/helper'
import { Button } from '../../components/buttons'
import { API_URL } from '../../config/variables'
import { useAuth } from '../../contexts/AuthContext'
import { isAvailableByDefault } from '../../utils/dates'
import dayjs from 'dayjs'

const OrderCreatePage = ({}) => {
  const [community, setCommunity] = useState<any>()
  const [showCommunitySearchResult, setShowCommunitySearchResult] = useState(false)
  const communitySearchResultRef = useOuterClick(() => setShowCommunitySearchResult(false))
  const [communitySearchText, setCommunitySearchText] = useState('')
  const [communitySearchResult, setCommunitySearchResult] = useState<any>([])

  const [user, setUser] = useState<any>()
  const [showUserSearchResult, setShowUserSearchResult] = useState(false)
  const userSearchResultRef = useOuterClick(() => setShowUserSearchResult(false))
  const [userSearchText, setUserSearchText] = useState('')
  const [userSearchResult, setUserSearchResult] = useState<any>([])

  const [shops, setShops] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [cart, setCart] = useState<any[]>([])

  const [showCalendar, setShowCalendar] = useState(false)
  const calendarRef = useOuterClick(() => setShowCalendar(false))

  const { firebaseToken } = useAuth()

  useEffect(() => {
    getCommunityShops(community)
  }, [community])

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
  }

  const userSearchHandler: ChangeEventHandler<HTMLInputElement> = async (e) => {
    setUserSearchText(e.target.value)
    if (e.target.value.length > 2) {
      const usersRef = getUsers({ search: e.target.value })
      const result = await usersRef.get()
      const users = result.docs.map((doc) => {
        const data = doc.data()
        return { ...data, id: doc.id }
      })
      setUserSearchResult(users)
      setShowUserSearchResult(users.length > 0)
    } else {
      setShowUserSearchResult(false)
      setUserSearchResult([])
    }
  }

  const userSelectHandler = (user: any) => {
    setShowUserSearchResult(false)
    setUserSearchResult([])
    setUser(user)
    setUserSearchText(user.email)
  }

  const setupDataList = async (docs: any) => {
    const newShops = docs.map((doc: any): any => ({
      id: doc.id,
      ...doc.data(),
      products: [],
    }))
    for (let shop of newShops) {
      let products: any = getProductsByShop(shop.id)
      products = await products.get()
      products = products.docs.map((doc: any): any => ({ id: doc.id, ...doc.data() }))
      shop.products = products
    }
    setShops(newShops)
    setLoading(false)
  }

  const getCommunityShops = async (community: any) => {
    if (!community) return
    setLoading(true)
    const shops = getShopsByCommunity(community.id)
    const shopsData = await shops.get()
    setupDataList(shopsData.docs)
  }

  const addToCart = (shop: any, product: any) => {
    const newCart = [...cart]
    let shopCart = newCart.find((c) => c.shop_id === (shop.shop_id || shop.id))
    if (!shopCart) {
      shopCart = {
        shop_id: shop.id,
        name: shop.name,
        operating_hours: shop.operating_hours,
        products: [],
      }
      newCart.push(shopCart)
    }
    let cartProduct = shopCart.products.find((p: any) => p.id === product.id)
    if (!cartProduct) {
      cartProduct = {
        id: product.id,
        name: product.name,
        price: product.base_price,
        image: product.gallery ? product.gallery[0].url : null,
        quantity: 0,
      }
      shopCart.products.push(cartProduct)
    }
    cartProduct.quantity += 1
    const newShopCartPrice = shopCart.products.reduce((totalPrice: number, p: any) => {
      const subtotalPrice = p.quantity * p.price
      totalPrice += subtotalPrice
      return totalPrice
    }, 0)
    shopCart.totalPrice = newShopCartPrice
    setCart(newCart)
  }

  const removeFromCart = (shop: any, product: any) => {
    let newCart = [...cart]
    let shopCart = newCart.find((c) => c.shop_id === shop.shop_id)
    if (!shopCart) return
    let cartProduct = shopCart.products.find((p: any) => p.id === product.id)
    if (!cartProduct) return
    cartProduct.quantity -= 1
    if (cartProduct.quantity <= 0) {
      shopCart.products = shopCart.products.filter((p: any) => p.id !== product.id)
    }
    if (!shopCart.products.length) {
      newCart = newCart.filter((c) => c.shop_id !== shop.shop_id)
    } else {
      const newShopCartPrice = shopCart.products.reduce((totalPrice: number, p: any) => {
        const subtotalPrice = p.quantity * p.price
        totalPrice += subtotalPrice
        return totalPrice
      }, 0)
      shopCart.totalPrice = newShopCartPrice
    }
    setCart(newCart)
  }

  const removeAllProductFromCart = (shop: any, product: any) => {
    let newCart = [...cart]
    let shopCart = newCart.find((c) => c.shop_id === shop.shop_id)
    if (!shopCart) return
    let cartProduct = shopCart.products.find((p: any) => p.id === product.id)
    if (!cartProduct) return
    shopCart.products = shopCart.products.filter((p: any) => p.id !== product.id)
    if (!shopCart.products.length) {
      newCart = newCart.filter((c) => c.shop_id !== shop.shop_id)
    } else {
      const newShopCartPrice = shopCart.products.reduce((totalPrice: number, p: any) => {
        const subtotalPrice = p.quantity * p.price
        totalPrice += subtotalPrice
        return totalPrice
      }, 0)
      shopCart.totalPrice = newShopCartPrice
    }
    setCart(newCart)
  }

  const setDeliveryDateOnShopCart = (shop: any, date: Date) => {
    let newCart = [...cart]
    let shopCart = newCart.find((c) => c.shop_id === shop.shop_id)
    if (!shopCart) return
    shopCart.deliveryDate = date
    console.log('newCart', newCart)
    setCart(newCart)
  }

  const checkout = async () => {
    for (let shopCart of cart) {
      if (API_URL && firebaseToken) {
        let url = `${API_URL}/orders`
        let method = 'POST'
        let res: any = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${firebaseToken}`,
          },
          method,
          body: JSON.stringify({
            ...shopCart,
            buyer_id: user?.id,
            delivery_date: new Date(),
            delivery_option: 'delivery',
            source: 'cms',
          }),
        })
        res = await res.json()
        console.log('res', res)
      } else {
        console.error('environment variable for the api does not exist.')
      }
    }
    setCart([])
  }

  return (
    <>
      <h2 className="text-2xl font-semibold leading-tight">Create Order</h2>
      <div className="flex items-center my-5 w-full">
        <div ref={communitySearchResultRef} className="relative">
          <TextField
            label="Community"
            required
            type="text"
            size="small"
            placeholder="Search"
            onChange={communitySearchHandler}
            value={communitySearchText}
            onFocus={() => setShowCommunitySearchResult(communitySearchResult.length > 0)}
            noMargin
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
        <div ref={userSearchResultRef} className="relative">
          <TextField
            label="User"
            required
            type="text"
            size="small"
            placeholder="Search"
            onChange={userSearchHandler}
            value={userSearchText}
            onFocus={() => setShowUserSearchResult(userSearchResult.length > 0)}
            noMargin
          />
          {showUserSearchResult && userSearchResult.length > 0 && (
            <div className="absolute top-full left-0 w-72 bg-white shadow z-10">
              {userSearchResult.map((user: any) => (
                <button
                  className="w-full p-1 hover:bg-gray-200 block text-left"
                  key={user.id}
                  onClick={() => userSelectHandler(user)}
                >
                  {user.email}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex relative">
        <div className="absolute right-2 top-0 shadow w-96 pt-2 px-2 pb-5">
          <p className="text-2xl">Cart:</p>
          {cart.map((shopCart) => (
            <div className="ml-2">
              <div className="relative flex">
                <p className="font-bold">{shopCart.name}</p>
                <div ref={calendarRef} className="ml-2 relative">
                  <button className="border-none bg-none text-primary-500" onClick={() => setShowCalendar(!showCalendar)}>
                    {shopCart.deliveryDate
                        ? dayjs(shopCart.deliveryDate).format('YYYY-MM-DD h:mm a')
                        : 'Delivery Date'}
                  </button>
                  {showCalendar && (
                    <ReactCalendar
                      className="w-72 absolute right-0 bottom-0"
                      onChange={(date: any) => setDeliveryDateOnShopCart(shopCart, date)}
                      tileDisabled={({ date }: any) =>
                        !isAvailableByDefault(date, shopCart) || date < new Date()
                      }
                      calendarType="US"
                      value={shopCart.deliveryDate}
                    />
                  )}
                </div>
              </div>
              {shopCart.products.map((product: any) => (
                <div className="ml-2 border-b-1 mb-2 py-2 flex items-center">
                  <div className="w-16 mr-2">
                    <img src={product.image} alt={product.name} className="max-w-16 max-h-16" />
                  </div>
                  <div className="">
                    <p>
                      {`${product.quantity} x ${product.name} = ${formatToPeso(
                        product.quantity * product.price
                      )}`}{' '}
                    </p>
                    <button
                      className="rounded px-1 bg-secondary-400 text-white mr-2"
                      onClick={() => removeFromCart(shopCart, product)}
                    >
                      -
                    </button>
                    <button
                      className="rounded px-1 bg-primary-400 text-white mr-2"
                      onClick={() => addToCart(shopCart, product)}
                    >
                      +
                    </button>
                    <button
                      className="rounded px-1 bg-danger-400 text-white"
                      onClick={() => removeAllProductFromCart(shopCart, product)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <p className="text-right text-sm">Total Price: {formatToPeso(shopCart.totalPrice)}</p>
            </div>
          ))}
          <div className="flex">
            <Button className="mt-5" disabled={!cart.length} onClick={checkout}>
              Check Out
            </Button>
            <Button
              className="mt-5 ml-2"
              color="danger"
              disabled={!cart.length}
              onClick={() => setCart([])}
            >
              Clear
            </Button>
          </div>
        </div>
        {loading ? (
          <div className="h-96 w-full relative">
            <ReactLoading
              type="spin"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              color="gray"
            />
          </div>
        ) : (
          <div className="h-full w-full overflow-y-auto mb-10 flex flex-wrap gap-8">
            {shops.map((shop) => (
              <div className="w-1/3 h-96 p-2 overflow-y-auto border border-2">
                <p className="text-2xl">{shop.name}</p>
                <img src={shop.profile_photo} alt={shop.name} className="max-w-full max-h-40 m-2" />
                {shop.products.map((product: any) => (
                  <div className="border-b-1 mb-2 py-2 flex items-center">
                    <div className="w-24 mr-2">
                      {product.gallery ? (
                        <img
                          src={product.gallery[0].url}
                          alt={product.name}
                          className="max-w-24 max-h-24"
                        />
                      ) : (
                        ''
                      )}
                    </div>
                    <div className="">
                      <p>{`${product.name} @ ${formatToPeso(product.base_price)}`} </p>
                      <button className="text-primary-500" onClick={() => addToCart(shop, product)}>
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default OrderCreatePage

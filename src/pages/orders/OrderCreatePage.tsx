import React, { ChangeEventHandler, useEffect, useState } from 'react'
import ReactLoading from 'react-loading'
import { TextField } from '../../components/inputs'
import useOuterClick from '../../customHooks/useOuterClick'
import { getCommunities } from '../../services/community'
import { getShopsByCommunity } from '../../services/shops'
import { getProductsByShop } from '../../services/products'
import { getUsers } from '../../services/users'
import { formatToPeso } from '../../utils/helper'
import { Button } from '../../components/buttons'

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
    console.log('newShops', newShops)
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
          <div className="ml-2">
            <p className="font-bold">GUNPLA Manila</p>
            <div className="ml-2 border-b-1 mb-2 py-2 flex items-center">
              <div className="w-16 mr-2">
                <img
                  src="https://www.1999.co.jp/itbig68/10684007.jpg"
                  alt="gundam"
                  className="max-w-16 max-h-16"
                />
              </div>
              <p>{`2 x HG RX-78-2 = ${formatToPeso(3400)}`} </p>
            </div>
            <div className="ml-2 border-b-1 mb-2 py-2 flex items-center">
              <div className="w-16 mr-2">
                <img
                  src="https://d2qbtfwqvouhxg.cloudfront.net/ban/bans58222_0.png?v=b355ecbe5fa6b0a08400a431b70aeaad"
                  alt="gundam"
                  className="max-w-16 max-h-16"
                />
              </div>
              <p>{`1 x MG Barbatos = ${formatToPeso(2700)}`} </p>
            </div>
            <div className="ml-2 border-b-1 mb-2 py-2 flex items-center">
              <div className="w-16 mr-2">
                <img
                  src="https://www.1999.co.jp/itbig23/10239040p_m.jpg"
                  alt="gundam"
                  className="max-w-16 max-h-16"
                />
              </div>
              <p>{`2 x MG Sazabi = ${formatToPeso(11000)}`} </p>
            </div>
            <p className="text-right text-sm">Total Price: {formatToPeso(17100)}</p>
          </div>
          <div className="ml-2">
            <p className="font-bold">Tilapia-an</p>
            <div className="ml-2 border-b-1 mb-2 py-2 flex items-center">
              <div className="w-16 mr-2">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf0yLFlPcDTKvgaqhTMegCe52UQmDXLUnBFA&usqp=CAU"
                  alt="tilapia"
                  className="max-w-16 max-h-16"
                />
              </div>
              <p>{`20 x Small Tilapia = ${formatToPeso(400)}`} </p>
            </div>
            <div className="ml-2 border-b-1 mb-2 py-2 flex items-center">
              <div className="w-16 mr-2">
                <img
                  src="https://images.thefishsite.com/fish%2Farticles%2Ftilapia-3-fai-brazilcredit-hideyoshi.png?scale.option=fill&scale.width=1200&scale.height=630&crop.width=1200&crop.height=630&crop.y=center&crop.x=center"
                  alt="tilapia"
                  className="max-w-16 max-h-16"
                />
              </div>
              <p>{`20 x Large Tilapia = ${formatToPeso(900)}`} </p>
            </div>
            <p className="text-right text-sm">Total Price: {formatToPeso(1300)}</p>
          </div>
          <Button className="mt-5">Check Out</Button>
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
                    <p>{`${product.name} @ ${formatToPeso(product.base_price)}`} </p>
                  </div>
                ))}
              </div>
            ))}
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
                    <p>{`${product.name} @ ${formatToPeso(product.base_price)}`} </p>
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

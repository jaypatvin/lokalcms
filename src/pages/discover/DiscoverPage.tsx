import React, { useEffect, useState } from 'react'
import ReactLoading from 'react-loading'
import dayjs from 'dayjs'
import ReactCalendar from 'react-calendar'
import { useCommunity } from '../../components/BasePage'
import { API_URL } from '../../config/variables'
import { useAuth } from '../../contexts/AuthContext'
import Dropdown from '../../components/Dropdown'
import { getCategories } from '../../services/categories'
import { OutlineButton } from '../../components/buttons'
import useOuterClick from '../../customHooks/useOuterClick'
import DiscoverProduct from './DiscoverProduct'
import DiscoverShop from './DiscoverShop'
import { Shop, Product } from '../../models'

type ShopData = Shop & { id: string; nextAvailable?: string; availableMessage?: string }
type ProductData = Product & { id: string; nextAvailable?: string; availableMessage?: string }

type ShopsResponse = {
  data: ShopData[]
}
type ProductsResponse = {
  data: ProductData[]
}
type DataType = 'shops' | 'products'

const DiscoverPage = () => {
  const { firebaseToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const calendarRef = useOuterClick(() => setShowCalendar(false))
  const [dataType, setDataType] = useState<DataType>('products')
  const [searchFilter, setSearchFilter] = useState('')
  const [category, setCategory] = useState('')
  const [dateFilter, setDateFilter] = useState(dayjs(new Date()).format('YYYY-MM-DD'))
  const [availableList, setAvailableList] = useState<(ShopData | ProductData)[]>([])
  const [unavailableList, setUnavailableList] = useState<(ShopData | ProductData)[]>([])
  const [categories, setCategories] = useState<string[]>([])

  const community = useCommunity()

  const getAvailableShops = async (urlParams: string = '') => {
    setLoading(true)
    if (API_URL && firebaseToken) {
      const url = `${API_URL}/availableShops?${urlParams}`
      const res: ShopsResponse = await (
        await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${firebaseToken}`,
          },
          method: 'GET',
        })
      ).json()
      const availables = res.data.filter((s) => !s.nextAvailable)
      const notAvailables = res.data.filter((s) => s.nextAvailable)
      setAvailableList(availables)
      setUnavailableList(notAvailables)
      console.log('res', res)
    } else {
      console.error('environment variable for the api does not exist.')
    }
    setLoading(false)
  }

  const getAvailableProducts = async (urlParams: string = '') => {
    setLoading(true)
    if (API_URL && firebaseToken) {
      const url = `${API_URL}/availableProducts?${urlParams}`
      const res: ProductsResponse = await (
        await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${firebaseToken}`,
          },
          method: 'GET',
        })
      ).json()
      const availables = res.data.filter((p) => !p.nextAvailable)
      const notAvailables = res.data.filter((p) => p.nextAvailable)
      setAvailableList(availables)
      setUnavailableList(notAvailables)
      console.log('res', res)
    } else {
      console.error('environment variable for the api does not exist.')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!categories.length) {
      getCategories({})
        .get()
        .then((snapshot) => {
          const data = snapshot.docs.map((doc) => doc.data())
          setCategories(data.map((c) => c.name))
        })
    }

    if (!community || !community.id) return
    const urlParamsArray = [`community_id=${community.id}`]
    if (searchFilter) urlParamsArray.push(`q=${searchFilter}`)
    if (category) urlParamsArray.push(`category=${category}`)
    if (dateFilter) urlParamsArray.push(`date=${dateFilter}`)
    const urlParams = urlParamsArray.join('&')
    if (dataType === 'products') getAvailableProducts(urlParams)
    if (dataType === 'shops') getAvailableShops(urlParams)
  }, [dataType, searchFilter, category, dateFilter, community])

  return (
    <>
      <h2 className="text-2xl font-semibold leading-tight">Discover</h2>
      <div className="flex items-center my-5">
        <input
          className="bg-gray-200 appearance-none border-2 border-gray-200 rounded py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
          type="text"
          placeholder="Search"
          onChange={(e) => setSearchFilter(e.target.value)}
        />
        <Dropdown
          className="ml-2"
          simpleOptions={['products', 'shops']}
          onSelect={(option) => setDataType(option.value as DataType)}
          currentValue={dataType}
        />
        <Dropdown
          name="Category"
          className="ml-2"
          simpleOptions={categories}
          onSelect={(option) => setCategory(option.value as string)}
          currentValue={category}
        />
        <div ref={calendarRef} className="ml-2 relative">
          <OutlineButton onClick={() => setShowCalendar(!showCalendar)}>{dateFilter}</OutlineButton>
          {showCalendar && (
            <ReactCalendar
              className="absolute"
              onChange={(date) => setDateFilter(dayjs(date as Date).format('YYYY-MM-DD'))}
              value={new Date(dateFilter)}
            />
          )}
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
        <>
          {!community || !community.id ? (
            <h2 className="text-xl ml-5">Select a community first</h2>
          ) : (
            <>
              <div className="mb-10">
                <h3 className="text-xl font-semibold leading-tight">Available:</h3>
                <div className="flex flex-wrap">
                  {availableList.length > 0 &&
                    dataType === 'shops' &&
                    availableList.map((item) => (
                      <DiscoverShop key={item.id} shop={item as ShopData} />
                    ))}
                  {availableList.length > 0 &&
                    dataType === 'products' &&
                    availableList.map((item) => (
                      <DiscoverProduct key={item.id} product={item as ProductData} />
                    ))}
                  {availableList.length === 0 && <p>None</p>}
                </div>
              </div>
              <div className="">
                <h3 className="text-xl font-semibold leading-tight">Unavailable:</h3>
                <div className="flex flex-wrap">
                  {unavailableList.length > 0 &&
                    dataType === 'shops' &&
                    unavailableList.map((item) => (
                      <DiscoverShop key={item.id} shop={item as ShopData} unavailable />
                    ))}
                  {unavailableList.length > 0 &&
                    dataType === 'products' &&
                    unavailableList.map((item) => (
                      <DiscoverProduct key={item.id} product={item as ProductData} unavailable />
                    ))}
                  {availableList.length === 0 && <p>None</p>}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  )
}

export default DiscoverPage

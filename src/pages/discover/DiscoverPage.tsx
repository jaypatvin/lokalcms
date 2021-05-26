import React, { useEffect, useState } from 'react'
import ReactLoading from 'react-loading'
import dayjs from 'dayjs'
import ReactCalendar from 'react-calendar'
import { API_URL } from '../../config/variables'
import { useAuth } from '../../contexts/AuthContext'
import Dropdown from '../../components/Dropdown'
import { getCategories } from '../../services/categories'
import { getCommunities } from '../../services/community'
import { ItemType } from '../../utils/types'
import { OutlineButton } from '../../components/buttons'
import useOuterClick from '../../customHooks/useOuterClick'
import DiscoverProduct from './DiscoverProduct'
import DiscoverShop from './DiscoverShop'

const DiscoverPage = ({}) => {
  const { firebaseToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const calendarRef = useOuterClick(() => setShowCalendar(false))
  const [dataType, setDataType] = useState<'shops' | 'products'>('products')
  const [searchFilter, setSearchFilter] = useState('')
  const [category, setCategory] = useState('')
  const [dateFilter, setDateFilter] = useState(dayjs(new Date()).format('YYYY-MM-DD'))
  const [selectedCommunity, setSelectedCommunity] = useState<any>()
  const [availableList, setAvailableList] = useState<any[]>([])
  const [unavailableList, setUnavailableList] = useState<any[]>([])
  const [categories, setCategories] = useState([])
  const [communities, setCommunities] = useState<ItemType[]>([])

  const getAvailableShops = async (urlParams: string = '') => {
    setLoading(true)
    let res: any
    if (API_URL && firebaseToken) {
      let url = `${API_URL}/availableShops?${urlParams}`
      res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firebaseToken}`,
        },
        method: 'GET',
      })
      res = await res.json()
      console.log('res', res)
      setAvailableList(res.data)
      setUnavailableList(res.unavailable_shops)
    } else {
      console.error('environment variable for the api does not exist.')
    }
    setLoading(false)
  }

  const getAvailableProducts = async (urlParams: string = '') => {
    setLoading(true)
    let res: any
    if (API_URL && firebaseToken) {
      let url = `${API_URL}/availableProducts?${urlParams}`
      res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firebaseToken}`,
        },
        method: 'GET',
      })
      res = await res.json()
      setAvailableList(res.data)
      setUnavailableList(res.unavailable_products)
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
        .then((snapshot: any) => {
          const data = snapshot.docs.map((doc: any) => doc.data())
          setCategories(data.map((c: any) => c.name))
        })
    }
    if (!communities.length) {
      getCommunities({})
        .get()
        .then((snapshot: any) => {
          const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
          setCommunities(data.map((c: any) => ({ key: c.id, label: c.name })))
        })
    }

    if (!selectedCommunity) return
    const urlParamsArray = [`community_id=${selectedCommunity.key}`]
    if (searchFilter) urlParamsArray.push(`q=${searchFilter}`)
    if (category) urlParamsArray.push(`category=${category}`)
    if (dateFilter) urlParamsArray.push(`date=${dateFilter}`)
    const urlParams = urlParamsArray.join('&')
    if (dataType === 'products') getAvailableProducts(urlParams)
    if (dataType === 'shops') getAvailableShops(urlParams)
  }, [dataType, searchFilter, category, dateFilter, selectedCommunity])

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
          onSelect={(option: any) => setDataType(option.value)}
          currentValue={dataType}
        />
        <Dropdown
          name="Category"
          className="ml-2"
          simpleOptions={categories}
          onSelect={(option: any) => setCategory(option.value)}
          currentValue={category}
        />
        <Dropdown
          name="Community"
          className="ml-2"
          options={communities}
          onSelect={(option: any) => setSelectedCommunity(option)}
          currentValue={selectedCommunity ? selectedCommunity.value : null}
        />
        <div ref={calendarRef} className="ml-2 relative">
          <OutlineButton onClick={() => setShowCalendar(!showCalendar)}>{dateFilter}</OutlineButton>
          {showCalendar && (
            <ReactCalendar
              className="absolute"
              onChange={(date: any) => setDateFilter(dayjs(date).format('YYYY-MM-DD'))}
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
          <div className="mb-10">
            <h3 className="text-xl font-semibold leading-tight">Available:</h3>
            <div className="flex flex-wrap">
              {availableList.length > 0 &&
                dataType === 'shops' &&
                availableList.map((item) => <DiscoverShop key={item.id} shop={item} />)}
              {availableList.length > 0 &&
                dataType === 'products' &&
                availableList.map((item) => <DiscoverProduct key={item.id} product={item} />)}
              {availableList.length === 0 && <p>None</p>}
            </div>
          </div>
          <div className="">
            <h3 className="text-xl font-semibold leading-tight">Unavailable:</h3>
            <div className="flex flex-wrap">
              {unavailableList.length > 0 &&
                dataType === 'shops' &&
                unavailableList.map((item) => <DiscoverShop key={item.id} shop={item} unavailable />)}
              {unavailableList.length > 0 &&
                dataType === 'products' &&
                unavailableList.map((item) => (
                  <DiscoverProduct key={item.id} product={item} unavailable />
                ))}
              {availableList.length === 0 && <p>None</p>}
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default DiscoverPage

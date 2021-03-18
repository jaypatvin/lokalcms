import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Button } from '../../components/buttons'
import { LimitType, ShopFilterType, ShopSortByType, SortOrderType } from '../../utils/types'
import SortButton from '../../components/buttons/SortButton'
import Dropdown from '../../components/Dropdown'
import ShopCreateUpdateForm from './ShopCreateUpdateForm'
import ShopListItems from './ShopListItems'
import ShopMenu from './ShopMenu'
import { getShops } from '../../services/shops'
import { fetchUserByID } from '../../services/users'

// Init
dayjs.extend(relativeTime)

const ShopListPage = (props: any) => {
  const [shopsList, setShopsList] = useState<any>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ShopFilterType>('all')
  const [sortBy, setSortBy] = useState<ShopSortByType>('name')
  const [sortOrder, setSortOrder] = useState<SortOrderType>('asc')
  const [limit, setLimit] = useState<LimitType>(10)
  const [pageNum, setPageNum] = useState(1)
  const [shopsRef, setShopsRef] = useState<any>()
  const [snapshot, setSnapshot] = useState<any>()
  const [firstShopOnList, setFirstShopOnList] = useState<any>()
  const [lastShopOnList, setLastShopOnList] = useState<any>()
  const [isLastPage, setIsLastPage] = useState(false)
  const [isCreateShopOpen, setIsCreateShopOpen] = useState(false)
  const [shopModalMode, setShopModalMode] = useState<'create' | 'update'>('create')
  const [shopToUpdate, setShopToUpdate] = useState<any>()

  const getShopsList = async (docs: any[]) => {
    const newList = docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    for (let i = 0; i < newList.length; i++) {
      const shop = newList[i]
      const user = await fetchUserByID(shop.user_id)
      const userData = user.data()
      if (userData) {
        shop.user_email = userData.email
      }
    }
    setShopsList(newList)
    setLastShopOnList(docs[docs.length - 1])
    setFirstShopOnList(docs[0])
  }

  useEffect(() => {
    const newShopsRef = getShops({ search, filter, sortBy, sortOrder, limit })
    if (snapshot && snapshot.unsubscribe) snapshot.unsubscribe() // unsubscribe current listener
    const newUnsubscribe = newShopsRef.onSnapshot((snapshot: any) => {
      getShopsList(snapshot.docs)
    })
    setSnapshot({ unsubscribe: newUnsubscribe })
    setShopsRef(newShopsRef)
    setPageNum(1)
    setIsLastPage(false)
  }, [search, filter, sortBy, sortOrder, limit])

  const onNextPage = () => {
    if (shopsRef && lastShopOnList) {
      const newShopsRef = shopsRef.startAfter(lastShopOnList).limit(limit)
      newShopsRef.onSnapshot(async (snapshot: any) => {
        if (snapshot.docs.length) {
          getShopsList(snapshot.docs)
          setPageNum(pageNum + 1)
        } else if (!isLastPage) {
          setIsLastPage(true)
        }
      })
    }
  }

  const onPreviousPage = () => {
    const newPageNum = pageNum - 1
    if (shopsRef && firstShopOnList && newPageNum > 0) {
      const newShopsRef = shopsRef.endBefore(firstShopOnList).limitToLast(limit)
      newShopsRef.onSnapshot(async (snapshot: any) => {
        getShopsList(snapshot.docs)
      })
    }
    setIsLastPage(false)
    setPageNum(Math.max(1, newPageNum))
  }

  const onSort = (sortName: ShopSortByType) => {
    if (sortName === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(sortName)
      setSortOrder('asc')
    }
  }

  const openCreateShop = () => {
    setIsCreateShopOpen(true)
    setShopModalMode('create')
    setShopToUpdate(undefined)
  }

  const openUpdateShop = (shop: any) => {
    setIsCreateShopOpen(true)
    setShopModalMode('update')
    const data = {
      id: shop.id,
      user_id: shop.user_id,
      name: shop.name,
      description: shop.description,
      is_close: shop.is_close,
      status: shop.status,
      opening: shop.operating_hours.opening,
      closing: shop.operating_hours.closing,
      use_custom_hours: shop.operating_hours.custom,
      custom_hours: shop.operating_hours,
    }
    setShopToUpdate(data)
  }

  return (
    <div className="flex flex-row w-full">
      {isCreateShopOpen && (
        <ShopCreateUpdateForm
          isOpen={isCreateShopOpen}
          setIsOpen={setIsCreateShopOpen}
          shopToUpdate={shopToUpdate}
          mode={shopModalMode}
        />
      )}
      <ShopMenu selected={filter} onSelect={setFilter} />
      <div className="pb-8 flex-grow">
        <div className="-mb-2 pb-2 flex flex-wrap flex-grow justify-between">
          <div className="flex items-center">
            <input
              className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
              id="inline-searcg"
              type="text"
              placeholder="Search"
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex justify-between align-middle ml-4">
              <div className="flex items-center">
                Show:{' '}
                <Dropdown
                  className="ml-1"
                  simpleOptions={[10, 25, 50, 100]}
                  onSelect={(option: any) => setLimit(option.value)}
                  currentValue={limit}
                  size="small"
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
          </div>
          <div className="flex items-center">
            <Button icon="add" size="small" onClick={openCreateShop}>
              New Shop
            </Button>
          </div>
        </div>
        <div className="table-wrapper">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>
                    <SortButton
                      className="text-xs uppercase font-bold"
                      label="Name"
                      showSortIcons={sortBy === 'name'}
                      currentSortOrder={sortOrder}
                      onClick={() => onSort('name')}
                    />
                  </th>
                  <th>
                    <SortButton
                      className="text-xs uppercase font-bold"
                      label="Description"
                      showSortIcons={false}
                    />
                  </th>
                  <th>
                    <SortButton
                      className="text-xs uppercase font-bold"
                      label="Owner"
                      showSortIcons={false}
                    />
                  </th>
                  <th>
                    <SortButton
                      className="text-xs uppercase font-bold"
                      label="Is Close"
                      showSortIcons={sortBy === 'is_close'}
                      currentSortOrder={sortOrder}
                      onClick={() => onSort('is_close')}
                    />
                  </th>
                  <th>
                    <SortButton
                      className="text-xs uppercase font-bold"
                      label="Status"
                      showSortIcons={sortBy === 'status'}
                      currentSortOrder={sortOrder}
                      onClick={() => onSort('status')}
                    />
                  </th>
                  <th>
                    <SortButton
                      className="text-xs uppercase font-bold"
                      label="Created At"
                      showSortIcons={sortBy === 'created_at'}
                      currentSortOrder={sortOrder}
                      onClick={() => onSort('created_at')}
                    />
                  </th>
                  <th>
                    <SortButton
                      className="text-xs uppercase font-bold"
                      label="Updated At"
                      showSortIcons={sortBy === 'updated_at'}
                      currentSortOrder={sortOrder}
                      onClick={() => onSort('updated_at')}
                    />
                  </th>
                  <th className="action-col"></th>
                </tr>
              </thead>
              <tbody>
                <ShopListItems shops={shopsList} openUpdateShop={openUpdateShop} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShopListPage

import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Button } from '../../components/buttons'
import { LimitType, ProductFilterType, ProductSortByType, SortOrderType } from '../../utils/types'
import SortButton from '../../components/buttons/SortButton'
import Dropdown from '../../components/Dropdown'
import ProductCreateUpdateForm from './ProductCreateUpdateForm'
import ProductListItems from './ProductListItems'
import ProductMenu from './ProductMenu'
import { getProducts } from '../../services/products'
import { fetchShopByID } from '../../services/shops'
import { fetchUserByID } from '../../services/users'

// Init
dayjs.extend(relativeTime)

const ProductListPage = (props: any) => {
  const [productsList, setProductsList] = useState<any>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ProductFilterType>('all')
  const [sortBy, setSortBy] = useState<ProductSortByType>('name')
  const [sortOrder, setSortOrder] = useState<SortOrderType>('asc')
  const [limit, setLimit] = useState<LimitType>(10)
  const [pageNum, setPageNum] = useState(1)
  const [productsRef, setProductsRef] = useState<any>()
  const [snapshot, setSnapshot] = useState<any>()
  const [firstProductOnList, setFirstProductOnList] = useState<any>()
  const [lastProductOnList, setLastProductOnList] = useState<any>()
  const [isLastPage, setIsLastPage] = useState(false)
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false)
  const [productModalMode, setProductModalMode] = useState<'create' | 'update'>('create')
  const [productToUpdate, setProductToUpdate] = useState<any>()

  const getProductsList = async (docs: any[]) => {
    const newList = docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    for (let i = 0; i < newList.length; i++) {
      const product = newList[i]
      const user = await fetchUserByID(product.user_id)
      const userData = user.data()
      if (userData) {
        product.user_email = userData.email
      }
      const shop = await fetchShopByID(product.shop_id)
      const shopData = shop.data()
      if (shopData) {
        product.shop_name = shopData.name
      }
    }
    setProductsList(newList)
    setLastProductOnList(docs[docs.length - 1])
    setFirstProductOnList(docs[0])
  }

  useEffect(() => {
    const newProductsRef = getProducts({ search, filter, sortBy, sortOrder, limit })
    if (snapshot && snapshot.unsubscribe) snapshot.unsubscribe() // unsubscribe current listener
    const newUnsubscribe = newProductsRef.onSnapshot((snapshot: any) => {
      getProductsList(snapshot.docs)
    })
    setSnapshot({ unsubscribe: newUnsubscribe })
    setProductsRef(newProductsRef)
    setPageNum(1)
    setIsLastPage(false)
  }, [search, filter, sortBy, sortOrder, limit])

  const onNextPage = () => {
    if (productsRef && lastProductOnList) {
      const newProductsRef = productsRef.startAfter(lastProductOnList).limit(limit)
      newProductsRef.onSnapshot(async (snapshot: any) => {
        if (snapshot.docs.length) {
          getProductsList(snapshot.docs)
          setPageNum(pageNum + 1)
        } else if (!isLastPage) {
          setIsLastPage(true)
        }
      })
    }
  }

  const onPreviousPage = () => {
    const newPageNum = pageNum - 1
    if (productsRef && firstProductOnList && newPageNum > 0) {
      const newProductsRef = productsRef.endBefore(firstProductOnList).limitToLast(limit)
      newProductsRef.onSnapshot(async (snapshot: any) => {
        getProductsList(snapshot.docs)
      })
    }
    setIsLastPage(false)
    setPageNum(Math.max(1, newPageNum))
  }

  const onSort = (sortName: ProductSortByType) => {
    if (sortName === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(sortName)
      setSortOrder('asc')
    }
  }

  const openCreateProduct = () => {
    setIsCreateProductOpen(true)
    setProductModalMode('create')
    setProductToUpdate(undefined)
  }

  const openUpdateProduct = (product: any) => {
    setIsCreateProductOpen(true)
    setProductModalMode('update')
    const data = {
      id: product.id,
      shop_id: product.shop_id,
      name: product.name,
      description: product.description,
      base_price: product.base_price,
      quantity: product.quantity,
      status: product.status,
      product_category: product.product_category,
      gallery: product.gallery ? product.gallery.map((photo: any) => ({...photo})) : null,
    }
    setProductToUpdate(data)
  }

  return (
    <div className="flex flex-row w-full">
      {isCreateProductOpen && (
        <ProductCreateUpdateForm
          isOpen={isCreateProductOpen}
          setIsOpen={setIsCreateProductOpen}
          dataToUpdate={productToUpdate}
          mode={productModalMode}
        />
      )}
      <ProductMenu selected={filter} onSelect={setFilter} />
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
            <Button icon="add" size="small" onClick={openCreateProduct}>
              New Product
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
                      label="Shop"
                      showSortIcons={false}
                    />
                  </th>
                  <th>
                    <SortButton
                      className="text-xs uppercase font-bold"
                      label="Price"
                      showSortIcons={sortBy === 'base_price'}
                      currentSortOrder={sortOrder}
                      onClick={() => onSort('base_price')}
                    />
                  </th>
                  <th>
                    <SortButton
                      className="text-xs uppercase font-bold"
                      label="Quantity"
                      showSortIcons={sortBy === 'quantity'}
                      currentSortOrder={sortOrder}
                      onClick={() => onSort('quantity')}
                    />
                  </th>
                  <th>
                    <SortButton
                      className="text-xs uppercase font-bold"
                      label="Category"
                      showSortIcons={sortBy === 'product_category'}
                      currentSortOrder={sortOrder}
                      onClick={() => onSort('product_category')}
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
                <ProductListItems products={productsList} openUpdateProduct={openUpdateProduct} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductListPage

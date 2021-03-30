import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Button } from '../../components/buttons'
import { LimitType, CategoryFilterType, CategorySortByType, SortOrderType } from '../../utils/types'
import SortButton from '../../components/buttons/SortButton'
import Dropdown from '../../components/Dropdown'
import CategoryCreateUpdateForm from './CategoryCreateUpdateForm'
import CategoryListItems from './CategoryListItems'
import CategoryMenu from './CategoryMenu'
import { getCategories } from '../../services/categories'
import { fetchShopByID } from '../../services/shops'
import { fetchUserByID } from '../../services/users'

// Init
dayjs.extend(relativeTime)

const CategoryListPage = (props: any) => {
  const [categoriesList, setCategoriesList] = useState<any>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<CategoryFilterType>('all')
  const [sortBy, setSortBy] = useState<CategorySortByType>('name')
  const [sortOrder, setSortOrder] = useState<SortOrderType>('asc')
  const [limit, setLimit] = useState<LimitType>(10)
  const [pageNum, setPageNum] = useState(1)
  const [categoriesRef, setCategoriesRef] = useState<any>()
  const [snapshot, setSnapshot] = useState<any>()
  const [firstCategoryOnList, setFirstCategoryOnList] = useState<any>()
  const [lastCategoryOnList, setLastCategoryOnList] = useState<any>()
  const [isLastPage, setIsLastPage] = useState(false)
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false)
  const [categoryModalMode, setCategoryModalMode] = useState<'create' | 'update'>('create')
  const [categoryToUpdate, setCategoryToUpdate] = useState<any>()

  const getCategoriesList = async (docs: any[]) => {
    const newList = docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    for (let i = 0; i < newList.length; i++) {
      const category = newList[i]
      const user = await fetchUserByID(category.user_id)
      const userData = user.data()
      if (userData) {
        category.user_email = userData.email
      }
      const shop = await fetchShopByID(category.shop_id)
      const shopData = shop.data()
      if (shopData) {
        category.shop_name = shopData.name
      }
    }
    setCategoriesList(newList)
    setLastCategoryOnList(docs[docs.length - 1])
    setFirstCategoryOnList(docs[0])
  }

  useEffect(() => {
    const newCategoriesRef = getCategories({ search, filter, sortBy, sortOrder, limit })
    if (snapshot && snapshot.unsubscribe) snapshot.unsubscribe() // unsubscribe current listener
    const newUnsubscribe = newCategoriesRef.onSnapshot((snapshot: any) => {
      getCategoriesList(snapshot.docs)
    })
    setSnapshot({ unsubscribe: newUnsubscribe })
    setCategoriesRef(newCategoriesRef)
    setPageNum(1)
    setIsLastPage(false)
  }, [search, filter, sortBy, sortOrder, limit])

  const onNextPage = () => {
    if (categoriesRef && lastCategoryOnList) {
      const newCategoriesRef = categoriesRef.startAfter(lastCategoryOnList).limit(limit)
      newCategoriesRef.onSnapshot(async (snapshot: any) => {
        if (snapshot.docs.length) {
          getCategoriesList(snapshot.docs)
          setPageNum(pageNum + 1)
        } else if (!isLastPage) {
          setIsLastPage(true)
        }
      })
    }
  }

  const onPreviousPage = () => {
    const newPageNum = pageNum - 1
    if (categoriesRef && firstCategoryOnList && newPageNum > 0) {
      const newCategoriesRef = categoriesRef.endBefore(firstCategoryOnList).limitToLast(limit)
      newCategoriesRef.onSnapshot(async (snapshot: any) => {
        getCategoriesList(snapshot.docs)
      })
    }
    setIsLastPage(false)
    setPageNum(Math.max(1, newPageNum))
  }

  const onSort = (sortName: CategorySortByType) => {
    if (sortName === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(sortName)
      setSortOrder('asc')
    }
  }

  const openCreateCategory = () => {
    setIsCreateCategoryOpen(true)
    setCategoryModalMode('create')
    setCategoryToUpdate(undefined)
  }

  const openUpdateCategory = (category: any) => {
    setIsCreateCategoryOpen(true)
    setCategoryModalMode('update')
    const data = {
      id: category.id,
      name: category.name,
      description: category.description,
      icon_url: category.icon_url,
      cover_url: category.cover_url,
      status: category.status,
    }
    setCategoryToUpdate(data)
  }

  return (
    <div className="flex flex-row w-full">
      {isCreateCategoryOpen && (
        <CategoryCreateUpdateForm
          isOpen={isCreateCategoryOpen}
          setIsOpen={setIsCreateCategoryOpen}
          dataToUpdate={categoryToUpdate}
          mode={categoryModalMode}
        />
      )}
      <CategoryMenu selected={filter} onSelect={setFilter} />
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
            <Button icon="add" size="small" onClick={openCreateCategory}>
              New Category
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
                <CategoryListItems
                  categories={categoriesList}
                  openUpdateCategory={openUpdateCategory}
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryListPage

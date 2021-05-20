import React, { useState, useEffect } from 'react'
import ReactLoading from 'react-loading'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Button } from '../buttons'
import {
  FilterGroupsType,
  GetFilterProps,
  LimitType,
  MenuItemType,
  PageNames,
  SortOrderType,
} from '../../utils/types'
import FiltersMenu from './FiltersMenu'
import SortButton from '../buttons/SortButton'
import Dropdown from '../Dropdown'
import CreateUpdateForm from './CreateUpdateForm'
import ListItems from './ListItems'

// Init
dayjs.extend(relativeTime)

type ListColumn = {
  label: string
  fieldName: string
  sortable?: boolean
}

type ListColumns = ListColumn[]

type Props = {
  name: PageNames
  menuName: string
  createLabel?: string
  columns: ListColumns
  filter: string
  filterMenuOptions?: MenuItemType[]
  filterMenus?: FilterGroupsType
  onChangeFilter: (arg: any) => void
  sortBy: string
  onChangeSortBy: (arg: any) => void
  sortOrder: SortOrderType
  onChangeSortOrder: (arg: SortOrderType) => void
  getData: ({
    search,
    limit,
  }: {
    search?: string
    limit?: number
  }) => firebase.default.firestore.Query<firebase.default.firestore.DocumentData>
  setupDataList: (
    arg: firebase.default.firestore.QueryDocumentSnapshot<firebase.default.firestore.DocumentData>[]
  ) => Promise<firebase.default.firestore.DocumentData[]>
  normalizeDataToUpdate?: (
    arg: firebase.default.firestore.DocumentData
  ) => firebase.default.firestore.DocumentData
  onDelete?: (arg: firebase.default.firestore.DocumentData) => Promise<any>
  onArchive?: (arg: firebase.default.firestore.DocumentData) => Promise<any>
  onUnarchive?: (arg: firebase.default.firestore.DocumentData) => Promise<any>
  noActions?: boolean
}

const ListPage = ({
  name,
  menuName,
  filterMenuOptions = [],
  filterMenus,
  createLabel,
  columns,
  filter,
  onChangeFilter,
  sortBy,
  onChangeSortBy,
  sortOrder,
  onChangeSortOrder,
  getData,
  setupDataList,
  normalizeDataToUpdate,
  onDelete,
  onArchive,
  onUnarchive,
  noActions,
}: Props) => {
  const [dataList, setDataList] = useState<firebase.default.firestore.DocumentData[]>([])
  const [search, setSearch] = useState('')
  const [limit, setLimit] = useState<LimitType>(10)
  const [pageNum, setPageNum] = useState(1)
  const [dataRef, setDataRef] = useState<
    firebase.default.firestore.Query<firebase.default.firestore.DocumentData>
  >()
  const [snapshot, setSnapshot] = useState<{ unsubscribe: () => void }>()
  const [firstDataOnList, setFirstDataOnList] = useState<
    firebase.default.firestore.QueryDocumentSnapshot<firebase.default.firestore.DocumentData>
  >()
  const [lastDataOnList, setLastDataOnList] = useState<
    firebase.default.firestore.QueryDocumentSnapshot<firebase.default.firestore.DocumentData>
  >()
  const [isLastPage, setIsLastPage] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'update'>('create')
  const [dataToUpdate, setDataToUpdate] = useState<firebase.default.firestore.DocumentData>()
  const [loading, setLoading] = useState(false)

  const getDataList = async (
    docs: firebase.default.firestore.QueryDocumentSnapshot<firebase.default.firestore.DocumentData>[]
  ) => {
    const newDataList = await setupDataList(docs)
    setDataList(newDataList)
    setLastDataOnList(docs[docs.length - 1])
    setFirstDataOnList(docs[0])
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    const newDataRef = getData({ search, limit })
    if (snapshot && snapshot.unsubscribe) snapshot.unsubscribe() // unsubscribe current listener
    const newUnsubscribe = newDataRef.onSnapshot(async (snapshot) => {
      getDataList(snapshot.docs)
    })
    setSnapshot({ unsubscribe: newUnsubscribe })
    setDataRef(newDataRef)
    setPageNum(1)
    setIsLastPage(false)
  }, [filter, filterMenus, search, sortBy, sortOrder, limit])

  const onNextPage = () => {
    if (dataRef && lastDataOnList && !isLastPage) {
      setLoading(true)
      const newDataRef = dataRef.startAfter(lastDataOnList).limit(limit)
      newDataRef.onSnapshot(async (snapshot: any) => {
        if (snapshot.docs.length) {
          getDataList(snapshot.docs)
          setPageNum(pageNum + 1)
        } else if (!isLastPage) {
          setLoading(false)
          setIsLastPage(true)
        }
      })
    }
  }

  const onPreviousPage = () => {
    const newPageNum = pageNum - 1
    if (dataRef && firstDataOnList && newPageNum > 0) {
      setLoading(true)
      const newDataRef = dataRef.endBefore(firstDataOnList).limitToLast(limit)
      newDataRef.onSnapshot(async (snapshot: any) => {
        getDataList(snapshot.docs)
      })
    }
    setIsLastPage(false)
    setPageNum(Math.max(1, newPageNum))
  }

  const onSort = (sortName: string) => {
    if (sortName === sortBy) {
      onChangeSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      onChangeSortBy(sortName)
      onChangeSortOrder('asc')
    }
  }

  const openCreate = () => {
    setIsCreateOpen(true)
    setModalMode('create')
    setDataToUpdate(undefined)
  }

  const openUpdate = (currentData: firebase.default.firestore.DocumentData) => {
    setIsCreateOpen(true)
    setModalMode('update')
    let data = currentData
    if (normalizeDataToUpdate) data = normalizeDataToUpdate(currentData)
    setDataToUpdate(data)
  }

  return (
    <div className="flex flex-row w-full">
      {isCreateOpen && (
        <CreateUpdateForm
          name={name}
          isOpen={isCreateOpen}
          setIsOpen={setIsCreateOpen}
          dataToUpdate={dataToUpdate}
          mode={modalMode}
        />
      )}
      <FiltersMenu
        options={filterMenuOptions}
        groupOptions={filterMenus}
        name={menuName}
        selected={filter}
        onSelect={onChangeFilter}
      />
      <div className="pb-8 w-5/6">
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
          {createLabel ? (
            <div className="flex items-center">
              <Button icon="add" size="small" onClick={openCreate}>
                {createLabel}
              </Button>
            </div>
          ) : (
            ''
          )}
        </div>
        <div className="table-wrapper w-full overflow-x-auto">
          {loading ? (
            <div className="h-96 w-full relative">
              <ReactLoading
                type="spin"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                color="gray"
              />
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column.fieldName}>
                        <SortButton
                          className="text-xs uppercase font-bold"
                          label={column.label}
                          showSortIcons={column.sortable && sortBy === column.fieldName}
                          currentSortOrder={sortOrder}
                          onClick={column.sortable ? () => onSort(column.fieldName) : undefined}
                        />
                      </th>
                    ))}
                    {!noActions && <th className="action-col"></th>}
                  </tr>
                </thead>
                <tbody>
                  <ListItems
                    name={name}
                    dataList={dataList}
                    openUpdate={openUpdate}
                    onDelete={onDelete}
                    onArchive={onArchive}
                    onUnarchive={onUnarchive}
                  />
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ListPage

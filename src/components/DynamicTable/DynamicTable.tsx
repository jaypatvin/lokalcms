import React, { useEffect, useState } from 'react'
import ReactLoading from 'react-loading'
import { get, cloneDeep } from 'lodash'
import { Button } from '../buttons'
import Dropdown from '../Dropdown'
import { MultiSelect, RadioSelectGroup } from '../inputs'
import { MultiSelectOption } from '../inputs/MultiSelect'
import DynamicRow from './DynamicRow'
import { Row, Cell, ContextMenu, DataItem, Column, FiltersMenu, TableConfig } from './types'
import { DocumentType } from '../../models'

type Data = DataItem[]

type Props = {
  dataRef: firebase.default.firestore.Query<DocumentType>
  allColumns: Column[]
  columnKeys: string[]
  contextMenu?: ContextMenu
  loading?: boolean
  filtersMenu?: FiltersMenu
  initialFilter?: { [x: string]: unknown }
  onChangeFilter?: (data: { [x: string]: unknown }) => void
  onChangeTableConfig?: (data: TableConfig) => void
}

const DynamicTable = ({
  dataRef,
  allColumns,
  columnKeys,
  contextMenu,
  loading,
  initialFilter,
  filtersMenu,
  onChangeFilter,
  onChangeTableConfig,
}: Props) => {
  const [tableConfig, setTableConfig] = useState<TableConfig>({
    search: '',
    limit: 10,
    page: 1,
  })
  const [dataList, setDataList] = useState<Data>([])
  const [snapshot, setSnapshot] = useState<{ unsubscribe: () => void }>()
  const [firstDataOnList, setFirstDataOnList] =
    useState<firebase.default.firestore.QueryDocumentSnapshot<DocumentType>>()
  const [lastDataOnList, setLastDataOnList] =
    useState<firebase.default.firestore.QueryDocumentSnapshot<DocumentType>>()
  const [isLastPage, setIsLastPage] = useState(false)

  const columns = allColumns.filter((col) => columnKeys.includes(col.key))
  const [shownColumns, setShownColumns] = useState<Column[]>(columns)
  const fieldOptions: MultiSelectOption[] = (allColumns ?? columns).map((col) => ({
    id: col.key,
    name: col.title,
    checked: shownColumns.some((scol) => scol.key === col.key),
  }))

  useEffect(() => {
    if (snapshot && snapshot.unsubscribe) snapshot.unsubscribe() // unsubscribe current listener
    const newUnsubscribe = dataRef.onSnapshot(async (snapshot) => {
      updateDataPagination(snapshot.docs)
    })
    setSnapshot({ unsubscribe: newUnsubscribe })
    setIsLastPage(false)
  }, [dataRef])

  const searchHandler = (value: string) => {
    const newConfig = { ...tableConfig, search: value }
    setTableConfig(newConfig)
    if (onChangeTableConfig) onChangeTableConfig(newConfig)
  }

  const limitHandler = (value: TableConfig['limit']) => {
    const newConfig = { ...tableConfig, limit: value }
    setTableConfig(newConfig)
    if (onChangeTableConfig) onChangeTableConfig(newConfig)
  }

  const fieldsFilterHandler = (options: MultiSelectOption[]) => {
    const newShownColumns = options
      .filter((option) => option.checked)
      .map((option) => (allColumns ?? columns).find((col) => col.key === option.id)!)
    setShownColumns(newShownColumns)
  }

  const rows = dataList.reduce((acc, item) => {
    const row: Cell[] = shownColumns.map((col) => {
      return {
        type: col.type,
        value: get(item, col.key),
        collection: col.collection,
        referenceField: col.referenceField,
        referenceLink: col.referenceLink,
      }
    })
    if (contextMenu) {
      const itemContextMenu = cloneDeep(contextMenu)
      for (const menuItem of itemContextMenu) {
        if (menuItem.onClick) {
          const originalMethod = menuItem.onClick
          menuItem.onClick = () => {
            originalMethod(item)
          }
        }
      }
      row.push({
        type: 'menu',
        value: itemContextMenu,
      })
    }
    acc.push(row)
    return acc
  }, [] as Row[])

  const updateDataPagination = async (
    docs: firebase.default.firestore.QueryDocumentSnapshot<DocumentType>[]
  ) => {
    const newDataList = docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    setDataList(newDataList)
    setLastDataOnList(docs[docs.length - 1])
    setFirstDataOnList(docs[0])
  }

  const onNextPage = () => {
    if (dataRef && lastDataOnList && !isLastPage) {
      const newDataRef = dataRef.startAfter(lastDataOnList).limit(tableConfig.limit)
      newDataRef.onSnapshot(async (snapshot: any) => {
        if (snapshot.docs.length) {
          updateDataPagination(snapshot.docs)
          const newConfig = { ...tableConfig, page: tableConfig.page + 1 }
          setTableConfig(newConfig)
        } else if (!isLastPage) {
          setIsLastPage(true)
        }
      })
    }
  }

  const onPreviousPage = () => {
    const newPageNum = tableConfig.page - 1
    if (dataRef && firstDataOnList && newPageNum > 0) {
      const newDataRef = dataRef.endBefore(firstDataOnList).limitToLast(tableConfig.limit)
      newDataRef.onSnapshot(async (snapshot: any) => {
        updateDataPagination(snapshot.docs)
      })
    }
    setIsLastPage(false)
    const newConfig = { ...tableConfig, page: Math.max(1, newPageNum) }
    setTableConfig(newConfig)
  }

  return (
    <div>
      <div className="-mb-2 pb-2 flex flex-wrap flex-grow justify-between">
        <div className="flex items-center">
          <input
            className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-64 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
            id="inline-search"
            type="text"
            placeholder="Search"
            onChange={(e) => searchHandler(e.target.value)}
          />
          <div className="flex justify-between align-middle mx-4">
            <div className="flex items-center">
              Show:{' '}
              <Dropdown
                className="ml-1"
                simpleOptions={[10, 25, 50, 100]}
                currentValue={tableConfig.limit}
                size="small"
                onSelect={(option) => limitHandler(option.value as TableConfig['limit'])}
              />
            </div>
            <Button
              className="ml-5"
              icon="arrowBack"
              size="small"
              color={tableConfig.page === 1 ? 'secondary' : 'primary'}
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
          <MultiSelect
            name="fields"
            size="small"
            options={fieldOptions}
            placeholder="Fields"
            onChange={fieldsFilterHandler}
          />
          {filtersMenu ? (
            <div className="ml-2">
              <RadioSelectGroup
                placeholder="Filters"
                size="small"
                options={filtersMenu}
                initialValue={initialFilter}
                onChange={onChangeFilter}
              />
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
      <div className="table-wrapper w-full">
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
                  {shownColumns.map((column) => (
                    <th key={column.title}>{column.title}</th>
                  ))}
                  {contextMenu ? <th className="action-col"></th> : ''}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <DynamicRow key={i} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default DynamicTable

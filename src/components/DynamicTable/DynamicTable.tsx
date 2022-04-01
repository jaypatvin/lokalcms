import React, { useState } from 'react'
import ReactLoading from 'react-loading'
import { get, cloneDeep } from 'lodash'
import { Button } from '../buttons'
import Dropdown from '../Dropdown'
import { MultiSelect } from '../inputs'
import { MultiSelectOption } from '../inputs/MultiSelect'
import DynamicRow from './DynamicRow'
import { Row, Cell, ContextMenu, DataItem, Column } from './types'

type Data = DataItem[]

type Props = {
  allColumns: Column[]
  columnKeys: string[]
  data: Data
  contextMenu?: ContextMenu
  loading?: boolean
}

const DynamicTable = ({ allColumns, columnKeys, data, contextMenu, loading }: Props) => {
  const columns = allColumns.filter((col) => columnKeys.includes(col.key))
  const [shownColumns, setShownColumns] = useState<Column[]>(columns)
  const fieldOptions: MultiSelectOption[] = (allColumns ?? columns).map((col) => ({
    id: col.key,
    name: col.title,
    checked: shownColumns.some((scol) => scol.key === col.key),
  }))

  const fieldsFilterHandler = (options: MultiSelectOption[]) => {
    const newShownColumns = options
      .filter((option) => option.checked)
      .map((option) => (allColumns ?? columns).find((col) => col.key === option.id)!)
    setShownColumns(newShownColumns)
  }

  const rows = data.reduce((acc, item) => {
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
  return (
    <div>
      <div className="-mb-2 pb-2 flex flex-wrap flex-grow justify-between">
        <div className="flex items-center">
          <input
            className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-64 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
            id="inline-search"
            type="text"
            placeholder="Search"
          />
          <div className="flex justify-between align-middle mx-4">
            <div className="flex items-center">
              Show:{' '}
              <Dropdown
                className="ml-1"
                simpleOptions={[10, 25, 50, 100]}
                currentValue={10}
                size="small"
              />
            </div>
            <Button className="ml-5" icon="arrowBack" size="small" color={'secondary'} />
            <Button className="ml-3" icon="arrowForward" size="small" color={'primary'} />
          </div>
          <MultiSelect
            name="fields"
            size="small"
            options={fieldOptions}
            placeholder="Fields"
            onChange={fieldsFilterHandler}
          />
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

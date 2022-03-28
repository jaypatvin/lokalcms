import React from 'react'
import DynamicRow from './DynamicRow'
import { Row, Cell, ContextMenu, DataItem, Column } from './types'

type Data = DataItem[]

type Props = {
  columns: Column[]
  data: Data
  contextMenu?: ContextMenu
}

const DynamicTable = ({ columns, data, contextMenu }: Props) => {
  const rows = data.reduce((acc, item) => {
    const row: Cell[] = columns.map((col) => ({ type: col.type, value: item[col.key] }))
    if (contextMenu) {
      for (const menuItem of contextMenu) {
        if (menuItem.onClick) {
          menuItem.onClick = () => menuItem.onClick!(item)
        }
      }
      row.push({
        type: 'menu',
        value: contextMenu,
      })
    }
    acc.push(row)
    return acc
  }, [] as Row[])
  return (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.title}>{column.title}</th>
          ))}
          {contextMenu ? <th className="action-col"></th> : ''}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <DynamicRow row={row} />
        ))}
      </tbody>
    </table>
  )
}

export default DynamicTable

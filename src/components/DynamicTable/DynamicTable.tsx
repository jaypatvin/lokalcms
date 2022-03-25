import React from 'react'

type Column = {
  title: string
  type:
    | 'string'
    | 'number'
    | 'currency'
    | 'schedule'
    | 'image'
    | 'gallery'
    | 'reference'
    | 'date'
    | 'datetime'
    | 'datepast'
    | 'datefuture'
}

type DataItem = {
  [x: string]: unknown
}

type Data = DataItem[]

type ContextItem = {
  title: string
  type?: 'default' | 'warning' | 'danger'
  onClick?: (data: DataItem) => void
}

type ContextMenu = ContextItem[]

type Props = {
  columns: Column[]
  data: Data
  contextMenu?: ContextMenu
}

const DynamicTable = ({ columns, data, contextMenu }: Props) => {
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
      <tbody></tbody>
    </table>
  )
}

export default DynamicTable

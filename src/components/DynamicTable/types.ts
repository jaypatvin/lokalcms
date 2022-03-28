export type DynamicType =
  | 'menu'
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

export type Cell = {
  type: DynamicType
  value?: unknown
}

export type Row = Cell[]

export type Column = {
  title: string
  key: string
  type: DynamicType
}

export type DataItem = {
  [x: string]: unknown
}

export type ContextItem = {
  title: string
  type?: 'default' | 'warning' | 'danger'
  onClick?: (data?: DataItem) => void
}

export type ContextMenu = ContextItem[]

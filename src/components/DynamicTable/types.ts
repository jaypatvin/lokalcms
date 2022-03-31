export type DynamicType =
  | 'menu'
  | 'string'
  | 'number'
  | 'boolean'
  | 'currency'
  | 'schedule'
  | 'image'
  | 'gallery'
  | 'reference'
  | 'date'
  | 'datetime'
  | 'datepast'
  | 'datefuture'
  | 'metadata'

export type Cell = {
  type: DynamicType
  value?: unknown
  collection?: 'community'
  referenceField?: string
  referenceLink?: string
}

export type Row = Cell[]

export type Column = {
  title: string
  key: string
  type: DynamicType
  collection?: 'community'
  referenceField?: string
  referenceLink?: string
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

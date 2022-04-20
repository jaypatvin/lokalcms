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
  | 'product'
  | 'products'

export type Cell = {
  type: DynamicType
  value?: unknown
  collection?: 'community' | 'users' | 'shops'
  referenceField?: string
  referenceLink?: string
}

export type Row = Cell[]

export type Column = {
  title: string
  key: string
  type: DynamicType
  collection?: 'community' | 'users' | 'shops'
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
  showOverride?: (data: DataItem) => boolean
}

export type ContextMenu = ContextItem[]

export type Filters = {
  title: string
  id: string
  options: { key: string; name: string }[]
}

export type FiltersMenu = Filters[]
export type SortMenu = FiltersMenu

export type TableConfig = {
  search: string
  limit: 10 | 25 | 50 | 100
  page: number
}
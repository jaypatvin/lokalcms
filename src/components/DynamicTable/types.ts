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
  | 'document'

export type Cell = {
  type: DynamicType
  value?: unknown
  documentType?: 'activity' | 'shop' | 'product' | 'community'
  collection?: 'community' | 'users' | 'shops' | 'activities' | 'products' | 'orders'
  referenceField?: string
  referenceLink?: string
}

export type Row = Cell[]

export type Column = {
  title: string
  key: string
  type: DynamicType
  getDocType?: (data: any) => 'activity' | 'shop' | 'product' | 'community'
  collection?: 'community' | 'users' | 'shops' | 'activities' | 'products' | 'orders'
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

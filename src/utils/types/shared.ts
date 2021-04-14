export type PageNames =
  | 'users'
  | 'communities'
  | 'invites'
  | 'shops'
  | 'products'
  | 'categories'
  | 'activities'
  | 'history_logs'
export type Size = 'small' | 'medium' | 'large'
export type Color = 'primary' | 'danger' | 'warning' | 'secondary'
export type ItemType = { key: string; label: string }
export type MenuItemType = { key: string; name: string; onClick?: (e: any, item: any) => void }
export type ButtonIcon =
  | 'add'
  | 'edit'
  | 'pencil'
  | 'trash'
  | 'search'
  | 'caretDown'
  | 'caretUp'
  | 'arrowBack'
  | 'arrowForward'
export type ErrorType = { field: string; message: string }
export type SortOrderType = 'asc' | 'desc'
export type LimitType = 10 | 25 | 50 | 100
export type GetFilterProps = {
  filter: string
  search: string
  sortBy: string
  sortOrder: string
  limit: number
}
export type FilterGroupType = {
  selected: string
  options: MenuItemType[]
}
export type FilterGroupsType = FilterGroupType[]
export type GenericGetArgType = { search?: string; limit?: number }

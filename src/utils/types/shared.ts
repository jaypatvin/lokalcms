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
  | 'caretDownLg'
  | 'caretUpLg'
  | 'arrowBack'
  | 'arrowForward'
  | 'calendar'
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
export type GenericGetArgType = { search?: string; limit?: number; community?: string }

export type Days = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
export const DayKeyVal: { [x: number]: Days } = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
}

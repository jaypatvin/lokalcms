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
export const nthDayOfMonthFormat = /^(1|2|3|4|5)-(mon|tue|wed|thu|fri|sat|sun)$/
export const decimalFormat = /^\d*(\.{1}\d+)?$/
export const integerFormat = /^[0-9]*$/

export type RepeatType =
  | 'day'
  | 'week'
  | 'month'
  | '1-mon'
  | '1-tue'
  | '1-wed'
  | '1-thu'
  | '1-fri'
  | '1-sat'
  | '1-sun'
  | '1-mon'
  | '2-tue'
  | '2-wed'
  | '2-thu'
  | '2-fri'
  | '2-sat'
  | '2-sun'
  | '3-mon'
  | '3-tue'
  | '3-wed'
  | '3-thu'
  | '3-fri'
  | '3-sat'
  | '3-sun'
  | '4-mon'
  | '4-tue'
  | '4-wed'
  | '4-thu'
  | '4-fri'
  | '4-sat'
  | '4-sun'
  | '5-mon'
  | '5-tue'
  | '5-wed'
  | '5-thu'
  | '5-fri'
  | '5-sat'
  | '5-sun'

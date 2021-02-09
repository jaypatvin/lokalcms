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

// --- User Types --- //
export type UserFilterType = 'all' | 'admin' | 'member' | 'archived'
export type UserSortByType = 'display_name' | 'community_name' | 'status' | 'created_at'
export const statusColorMap: any = {
  active: 'bg-green-400',
  suspended: 'bg-red-400',
  pending: 'bg-yellow-400',
  locked: 'bg-gray-400',
}

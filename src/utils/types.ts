export type Size = 'small' | 'medium' | 'large'
export type Color = 'primary' | 'danger' | 'warning' | 'secondary'
export type ItemType = { key: string; label: string }
export type MenuItemType = { key: string; name: string; onClick?: (e: any, item: any) => void }
export type ButtonIcon = 'add' | 'edit' | 'pencil' | 'trash' | 'search' | 'caretDown' | 'caretUp'
export type ErrorType = { field: string; message: string }
export type SortOrderType = 'asc' | 'desc'

// --- User Types --- //
export type UserRoleType = 'all' | 'admin' | 'member'
export type UserSortByType = 'first_name' | 'community_name' | 'status' | 'created_at'

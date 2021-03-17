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
  enabled: 'bg-green-400',
  suspended: 'bg-red-400',
  pending: 'bg-yellow-400',
  locked: 'bg-gray-400',
  disabled: 'bg-gray-400',
}

// --- Community Types --- //
export type CommunitySortByType =
  | 'name'
  | 'barangay'
  | 'city'
  | 'country'
  | 'state'
  | 'state'
  | 'subdivision'
export type CommunityFilterType = 'all' | 'archived'

// --- Invite Types --- //
export type InviteFilterType =
  | 'all'
  | 'enabled'
  | 'disabled'
  | 'claimed'
  | 'not_claimed'
  | 'archived'
export type InviteSortByType = 'invitee_email' | 'created_at' | 'status' | 'claimed' | 'expire_by'

// --- Shop Types --- //
export type ShopFilterType =
  | 'all'
  | 'enabled'
  | 'disabled'
  | 'open'
  | 'close'
  | 'archived'
export type ShopSortByType = 'name' | 'is_close' | 'status' | 'created_at' | 'updated_at'

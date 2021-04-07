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
export type ShopFilterType = 'all' | 'enabled' | 'disabled' | 'open' | 'close' | 'archived'
export type ShopSortByType = 'name' | 'is_close' | 'status' | 'created_at' | 'updated_at'
export type DaysType = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'
export type DaysSchedType = 'opening' | 'closing'
export type CustomHoursType = {
  sun?: {
    closing?: string
    opening?: string
  }
  mon?: {
    closing?: string
    opening?: string
  }
  tue?: {
    closing?: string
    opening?: string
  }
  wed?: {
    closing?: string
    opening?: string
  }
  thu?: {
    closing?: string
    opening?: string
  }
  fri?: {
    closing?: string
    opening?: string
  }
  sat?: {
    closing?: string
    opening?: string
  }
}

// --- Product Types --- //
export type ProductFilterType = 'all' | 'enabled' | 'disabled' | 'archived'
export type ProductSortByType =
  | 'name'
  | 'base_price'
  | 'quantity'
  | 'product_category'
  | 'status'
  | 'created_at'
  | 'updated_at'

// --- Category Types --- //
export type CategoryFilterType = 'all' | 'enabled' | 'disabled' | 'archived'
export type CategorySortByType = 'name' | 'status' | 'created_at' | 'updated_at'

// --- Activity Types --- //
export type ActivityFilterType = 'all' | 'enabled' | 'disabled' | 'archived'
export type ActivitySortByType = 'message' | 'status' | 'created_at' | 'updated_at'
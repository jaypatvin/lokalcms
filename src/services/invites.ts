import { SortOrderType, InviteSortByType } from '../utils/types'
import { db } from '../utils'

export type InviteFilterType = {
  status: string
  claimed: 'all' | boolean
  archived?: boolean
}

export type InviteSort = {
  sortBy: InviteSortByType
  sortOrder: SortOrderType
}

type GetInvitesParamTypes = {
  search?: string
  filter?: InviteFilterType
  sort?: InviteSort
  limit?: number
  community?: string
}

export const getInvitesByCommunity = (community_id: string, limit = 10) => {
  return db.invites
    .where('community_id', '==', community_id)
    .orderBy('created_at', 'desc')
    .limit(limit)
}

export const getInvites = ({
  search = '',
  filter = { status: 'all', claimed: 'all', archived: false },
  sort = { sortBy: 'created_at', sortOrder: 'desc' },
  limit = 10,
  community,
}: GetInvitesParamTypes) => {
  let ref = db.invites.where('keywords', 'array-contains', search.toLowerCase())

  if (community) {
    ref = ref.where('community_id', '==', community)
  }

  if (filter.status !== 'all') {
    ref = ref.where('status', '==', filter.status)
  }
  if (filter.claimed !== 'all') {
    ref = ref.where('claimed', '==', filter.claimed)
  }

  ref = ref
    .where('archived', '==', filter.archived)
    .orderBy(sort.sortBy, sort.sortOrder)
    .limit(limit)

  return ref
}

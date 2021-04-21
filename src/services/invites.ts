import { SortOrderType, InviteSortByType, InviteFilterType } from '../utils/types'
import { db } from './firebase'

type GetInvitesParamTypes = {
  search?: string
  filter?: InviteFilterType
  sortBy?: InviteSortByType
  sortOrder?: SortOrderType
  limit?: number
}

export const getInvites = ({
  search = '',
  filter = 'all',
  sortBy = 'created_at',
  sortOrder = 'desc',
  limit = 10,
}: GetInvitesParamTypes) => {
  let ref = db.collection('invites').where('keywords', 'array-contains', search.toLowerCase())
  if (['enabled', 'disabled'].includes(filter)) {
    ref = ref.where('status', '==', filter)
  } else if (['claimed', 'not_claimed'].includes(filter)) {
    const claimed = filter === 'claimed'
    ref = ref.where('claimed', '==', claimed)
  }
  ref = ref
    .where('archived', '==', filter === 'archived')
    .orderBy(sortBy, sortOrder)
    .limit(limit)

  return ref
}

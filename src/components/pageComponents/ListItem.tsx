import React from 'react'
import { ListItemProps } from '../../utils/types'
import UserListItem from '../../pages/users/UserListItem'
import CommunityListItem from '../../pages/communities/CommunityListItem'
import InviteListItem from '../../pages/invites/InviteListItem'
import ShopListItem from '../../pages/shops/ShopListItem'
import ProductListItem from '../../pages/products/ProductListItem'
import CategoryListItem from '../../pages/categories/CategoryListItem'
import ActivityListItem from '../../pages/activities/ActivityListItem'
import HistoryListItem from '../../pages/history/HistoryListItem'

type Props = ListItemProps & { name: string }

const ListItem = ({
  name,
  data,
  openUpdate,
  onDelete,
  onArchive,
  onUnarchive,
  hideDelete,
  disableDelete = false,
  isArchived = false,
}: Props) => {
  let ListItemComponent = null

  switch (name) {
    case 'users':
      ListItemComponent = UserListItem
      break
    case 'communities':
      ListItemComponent = CommunityListItem
      break
    case 'invites':
      ListItemComponent = InviteListItem
      break
    case 'shops':
      ListItemComponent = ShopListItem
      break
    case 'products':
      ListItemComponent = ProductListItem
      break
    case 'categories':
      ListItemComponent = CategoryListItem
      break
    case 'activities':
      ListItemComponent = ActivityListItem
      break
    case 'history_logs':
      ListItemComponent = HistoryListItem
      break
    default:
      break
  }

  if (!ListItemComponent) return null
  return (
    <ListItemComponent
      data={data}
      openUpdate={openUpdate}
      onDelete={onDelete}
      onArchive={onArchive}
      onUnarchive={onUnarchive}
      hideDelete={hideDelete}
      disableDelete={disableDelete}
      isArchived={isArchived}
    />
  )
}

export default ListItem

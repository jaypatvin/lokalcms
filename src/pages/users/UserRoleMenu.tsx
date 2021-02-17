import React from 'react'
import MenuList from '../../components/MenuList'
import { MenuItemType, UserFilterType } from '../../utils/types'

type Props = {
  selected: string
  onSelect: (role: UserFilterType) => void
}

const UserRoleMenu = ({ onSelect, selected }: Props) => {
  const roles: MenuItemType[] = [
    {
      key: 'all',
      name: 'All Users',
      onClick: () => onSelect('all'),
    },
    {
      key: 'archived',
      name: 'Archived Users',
      onClick: () => onSelect('archived'),
    },
    {
      key: 'admins',
      name: 'Admins',
      onClick: () => onSelect('admin'),
    },
    {
      key: 'members',
      name: 'Members',
      onClick: () => onSelect('member'),
    },
  ]

  return (
    <div className="flex flex-row w-52 hidden mdl:block">
      <div className="pb-5">
        <h2 className="text-2xl font-semibold leading-tight">Users</h2>
      </div>
      <div>
        <MenuList items={roles} selected={selected} />
      </div>
    </div>
  )
}

export default UserRoleMenu

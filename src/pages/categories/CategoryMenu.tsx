import React from 'react'
import MenuList from '../../components/MenuList'
import { MenuItemType, CategoryFilterType } from '../../utils/types'

type Props = {
  selected: string
  onSelect: (filter: CategoryFilterType) => void
}

const CategoryMenu = ({ onSelect, selected }: Props) => {
  const roles: MenuItemType[] = [
    {
      key: 'all',
      name: 'All',
      onClick: () => onSelect('all'),
    },
    {
      key: 'enabled',
      name: 'Enabled',
      onClick: () => onSelect('enabled'),
    },
    {
      key: 'disabled',
      name: 'Disabled',
      onClick: () => onSelect('disabled'),
    },
    {
      key: 'archived',
      name: 'Archived',
      onClick: () => onSelect('archived'),
    },
  ]

  return (
    <div className="flex flex-row w-52 hidden mdl:block">
      <div className="pb-5">
        <h2 className="text-2xl font-semibold leading-tight">Categories</h2>
      </div>
      <div>
        <MenuList items={roles} selected={selected} />
      </div>
    </div>
  )
}

export default CategoryMenu

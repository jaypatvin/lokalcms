import React from 'react'
import MenuList from '../../components/MenuList'
import { CommunityFilterType, MenuItemType } from '../../utils/types'

type Props = {
  selected: string
  onSelect: (filter: CommunityFilterType) => void
}

const CommunityMenu = ({ onSelect, selected }: Props) => {
  const roles: MenuItemType[] = [
    {
      key: 'all',
      name: 'All Community',
      onClick: () => onSelect('all'),
    },
    {
      key: 'archived',
      name: 'Archived Community',
      onClick: () => onSelect('archived'),
    },
  ]

  return (
    <div className="flex flex-row w-52 hidden mdl:block">
      <div className="pb-5">
        <h2 className="text-2xl font-semibold leading-tight">Community</h2>
      </div>
      <div>
        <MenuList items={roles} selected={selected} />
      </div>
    </div>
  )
}

export default CommunityMenu

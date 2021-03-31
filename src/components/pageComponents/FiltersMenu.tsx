import React from 'react'
import MenuList from '../../components/MenuList'
import { MenuItemType } from '../../utils/types'

type Props = {
  name: string
  options: MenuItemType[]
  selected: string
  onSelect: (arg: string) => void
}

const FiltersMenu = ({ name, options, onSelect, selected }: Props) => {
  const menuOptions = options.map((option) => ({ ...option, onClick: () => onSelect(option.key) }))

  return (
    <div className="flex flex-row flex-shrink-0 w-1/6 hidden mdl:block">
      <div className="pb-5">
        <h2 className="text-2xl font-semibold leading-tight">{name}</h2>
      </div>
      <div>
        <MenuList items={menuOptions} selected={selected} />
      </div>
    </div>
  )
}

export default FiltersMenu

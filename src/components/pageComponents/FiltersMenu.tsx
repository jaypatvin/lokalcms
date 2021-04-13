import React from 'react'
import MenuList from '../../components/MenuList'
import { FilterGroupsType, MenuItemType } from '../../utils/types'

type Props = {
  name: string
  options?: MenuItemType[]
  groupOptions?: FilterGroupsType
  selected: string
  onSelect: (arg: string) => void
}

const FiltersMenu = ({ name, options = [], groupOptions = [], onSelect, selected }: Props) => {
  const menuOptions = options.map((option) => ({ ...option, onClick: () => onSelect(option.key) }))
  const menuGroupOptions = groupOptions.map(group => {
    const newOptions = group.options.map((option) => {
      if (!option.onClick) {
        return { ...option, onClick: () => onSelect(option.key) }
      }
      return option
    })
    return {
      selected: group.selected,
      options: newOptions
    }
  })

  return (
    <div className="flex flex-row flex-shrink-0 w-1/6 hidden mdl:block">
      <div className="pb-5">
        <h2 className="text-2xl font-semibold leading-tight">{name}</h2>
      </div>
      <div>
        {
          !options.length && menuGroupOptions.length > 0 && menuGroupOptions.map(group => <MenuList items={group.options} selected={group.selected} />)
        }
        {
          options.length > 0 && !menuGroupOptions.length && <MenuList items={menuOptions} selected={selected} />
        }
      </div>
    </div>
  )
}

export default FiltersMenu

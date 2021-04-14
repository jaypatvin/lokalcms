import React, { useState, useEffect } from 'react'
import { MenuItemType } from '../utils/types'

type Props = {
  items?: MenuItemType[]
  selected?: string
}

const MenuList = ({ items = [], selected = '' }: Props) => {
  const [selectedItem, setSelectedItem] = useState('')

  useEffect(() => {
    setSelectedItem(selected)
  }, [selected])

  const onClick = (e: any, item: MenuItemType) => {
    e.preventDefault()
    setSelectedItem(item.key)
    if (item.onClick) {
      item.onClick(e, item)
    }
    return false
  }

  return (
    <ul className='shadow-md'>
      {items.map((item) => {
        let _class =
          ' outline-none flex items-center block w-full rounded py-2 px-4 mb-2 transition-all focus:outline-none text-sm focus:outline-none '

        if (item.key === selectedItem) {
          _class = _class + ' bg-gray-100 text-green-800 font-medium shadow '
        } else {
          _class =
            _class + ' cursor-pointer text-gray-500 hover:bg-indigo-100 hover:text-green-900 '
        }

        return (
          <li key={item.key}>
            <button key={item.key} className={_class} onClick={(e) => onClick(e, item)}>
              <span className="">{item.name}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default MenuList

import React, { useState } from 'react'
import { cn } from '../utils/format'
import { useLocation, useRouteMatch, NavLink } from 'react-router-dom'
import {
  IoMdHome,
  IoMdSettings,
  IoIosPaperPlane,
  IoIosPeople,
  IoIosBasket,
  IoIosContacts,
} from 'react-icons/io'
import { ItemType } from '../utils/types'

const menus = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <IoMdHome size={23} />,
  },
  {
    key: 'communities',
    label: 'Communities',
    icon: <IoIosContacts size={23} />,
  },
  {
    key: 'activities',
    label: 'Activities',
    icon: <IoIosContacts size={23} />,
  },
  {
    key: 'shops',
    label: 'Shops',
    icon: <IoIosBasket size={23} />,
  },
  {
    key: 'products',
    label: 'Products',
    icon: <IoIosBasket size={23} />,
  },
  {
    key: 'categories',
    label: 'Categories',
    icon: <IoIosBasket size={23} />,
  },
  {
    key: 'users',
    label: 'Users',
    icon: <IoIosPeople size={23} />,
  },
  {
    key: 'invites',
    label: 'Invites',
    icon: <IoIosPaperPlane size={23} />,
  },
  {
    key: 'settings',
    label: 'Setting',
    icon: <IoMdSettings size={23} />,
  },
]

type Props = {
  menu: {
    key: string
    label: string
    icon: JSX.Element
    items?: ItemType[]
  }
}

const Item = (props: Props) => {
  const {
    menu: { key, label, icon, items },
  } = props

  let match = useRouteMatch(`/${key}`)
  let { pathname } = useLocation()
  const [isShowChild, setIsShowChild] = useState(false)

  const styles = {
    parrentItem: {
      default: [
        'cursor-pointer',
        'outline-none',
        'flex',
        'items-center',
        'block',
        'w-full',
        'rounded',
        'py-2',
        'px-4',
        'mb-2',
        'transition-all',
        match ? 'bg-teal-400 text-white font-medium shadow' : 'text-gray-500',
      ],
      hover: ['bg-indigo-100', 'text-green-900'],
      focus: ['outline-none'],
    },
    childItem: {
      default: ['py-2', 'px-4', 'block', 'text-gray-500', 'transition-all'],
    },
    label: {
      default: ['ml-6'],
    },
  }

  return (
    <>
      {items && (
        <div>
          <button className={cn(styles.parrentItem)} onClick={() => setIsShowChild(!isShowChild)}>
            {icon} <span className={cn(styles.label)}>{label}</span>
          </button>
          {isShowChild && (
            <div className="shadow ml-10 rounded mb-2">
              {items.map((item) => {
                const active = '/' + key + '/' + item.key === pathname
                return (
                  <NavLink
                    key={item.key}
                    to={`/${key}/${item.key}`}
                    className={cn(styles.childItem) + (active && ' bg-gray-200')}
                  >
                    {item.label}
                  </NavLink>
                )
              })}
            </div>
          )}
        </div>
      )}

      {!items && (
        <NavLink className={cn(styles.parrentItem)} to={`/${key}`} key={key}>
          {icon} <span className={cn(styles.label)}>{label}</span>
        </NavLink>
      )}
    </>
  )
}

const SideNav = () => {
  return (
    <>
      <div className="mx-2 my-4 py-4 flex-grow">
        <nav>
          <ul>
            {menus.map((menu) => {
              return (
                <li key={menu.key}>
                  <Item key={menu.key} menu={menu} />
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </>
  )
}

export default SideNav

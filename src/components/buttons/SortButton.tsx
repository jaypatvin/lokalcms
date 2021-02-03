import React from 'react'
import { buttonIcons } from './theme'
import { SortOrderType } from '../../utils/types'

type Props = {
  label: string
  showSortIcons?: boolean
  currentSortOrder?: SortOrderType
  className?: string
  onClick?: () => void
}

const SortButton = ({
  label,
  showSortIcons = true,
  currentSortOrder = 'asc',
  className = '',
  onClick,
}: Props) => {
  const handleClick = () => {
    if (onClick) onClick()
  }
  return (
    <button
      className={`${className} bg-none border-none cursor-pointer outline-none flex items-center`}
      onClick={handleClick}
    >
      {label}
      <span className={`ml-1 ${!showSortIcons ? 'opacity-0' : ''}`}>
        <div className={currentSortOrder !== 'asc' ? 'text-secondary-300' : ''}>
          {buttonIcons['caretUp']}
        </div>
        <div className={currentSortOrder !== 'desc' ? 'text-secondary-300' : ''}>
          {buttonIcons['caretDown']}
        </div>
      </span>
    </button>
  )
}

export default SortButton

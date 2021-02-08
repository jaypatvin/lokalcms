import React, { useState } from 'react'
import useOuterClick from '../customHooks/useOuterClick'
import { Color, ItemType, Size } from '../utils/types'
import { Button } from './buttons'

type OptionType = {
  key: string | number
  value: string | number
}

type Props = {
  name?: string
  options?: ItemType[]
  simpleOptions?: string[] | number[]
  onSelect?: (option: OptionType) => void
  currentValue?: ItemType | string | number
  className?: string
  size?: Size
  color?: Color
  buttonColor?: string
}

const Dropdown = ({
  name = '',
  options,
  simpleOptions,
  onSelect,
  currentValue,
  className = '',
  size='medium',
  color,
  buttonColor = ''
}: Props) => {
  const [open, setOpen] = useState(false)
  const ref = useOuterClick(() => setOpen(false))
  const displayedOptions: any = simpleOptions || options || []
  let displayName: string | number = name
  if (typeof currentValue === 'object' && currentValue) {
    displayName = currentValue.label
  } else if (currentValue) {
    displayName = currentValue
  }

  const handleSelect = (option: OptionType) => {
    if (onSelect) onSelect(option)
    setOpen(false)
  }

  const renderOption = (option: ItemType | string | number) => {
    let key: string | number
    let value: string | number
    if (typeof option === 'object' && option) {
      key = option.key
      value = option.label
    } else {
      key = option
      value = option
    }
    const optionObj = { key, value }
    return (
      <li key={optionObj.key}>
        <button className="p-2 hover:bg-gray-100 w-full" onClick={() => handleSelect(optionObj)}>{optionObj.value}</button>
      </li>
    )
  }

  return (
    <div ref={ref} className={`${className} relative`}>
      <Button customColor={buttonColor} size={size} onClick={() => setOpen(!open)}>{displayName}</Button>
      {open && <ul className="absolute top-full left-3 max-h-52 max-w-xs overflow-y-auto bg-white shadow">{displayedOptions.map(renderOption)}</ul>}
    </div>
  )
}

export default Dropdown

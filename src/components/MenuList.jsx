import React, { useState, useEffect } from 'react'

const MenuList = (props) => {
  const [selectedItem, setSelectedItem] = useState()

  let {
    items=[],
    selected="",
    ...rest
  } = props

  
  useEffect(() => {
    setSelectedItem(selected)
  }, [selected]);


  return (
    <>
      <ul>
      {items.map(item => {
        let _class = " outline-none flex items-center block w-full rounded py-2 px-4 mb-2 transition-all focus:outline-none text-sm focus:outline-none "

        if (item.key === selectedItem) {
          _class = _class + " bg-gray-100 text-green-800 font-medium shadow "
        } else {
          _class = _class + " cursor-pointer text-gray-500 hover:bg-indigo-100 hover:text-green-900 ";
        }

        return (
          <li key={item.key} >
            <button 
              key={item.key}
              className={_class}
              onClick={(e) => {
                e.preventDefault()
                setSelectedItem(item.key)
                item.onClick(e, item)
                return false;
              }}>
              <span className="">{item.name}</span>
            </button>
          </li>
          )
        })}
        
        
      </ul>
    </>
  )
}

export default MenuList
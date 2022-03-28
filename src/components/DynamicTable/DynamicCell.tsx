import { useState } from 'react'
import useOuterClick from '../../customHooks/useOuterClick'
import { Cell, ContextMenu } from './types'

type Props = {
  cell: Cell
}

const DynamicCell = ({ cell }: Props) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const optionsRef = useOuterClick(() => setIsOptionsOpen(false))

  switch (cell.type) {
    case 'string':
      return (
        <td>
          <p className="text-gray-900 whitespace-no-wrap">{cell.value as string}</p>
        </td>
      )
    case 'menu':
      return (
        <td className="action-col">
          <div ref={optionsRef} className="relative">
            <button
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
              type="button"
              className="inline-block text-gray-500 hover:text-gray-700"
            >
              <svg className="inline-block h-6 w-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm-2 6a2 2 0 104 0 2 2 0 00-4 0z" />
              </svg>
            </button>
            {isOptionsOpen ? (
              <div className="absolute top-0 right-full shadow w-36 bg-white">
                {(cell.value as ContextMenu).map((item) => (
                  <button
                    onClick={() => {
                      if (item.onClick) item.onClick()
                      setIsOptionsOpen(false)
                    }}
                    className={`block w-full p-2 hover:bg-gray-100 ${
                      item.type === 'danger' ? 'text-danger-600' : ''
                    } ${item.type === 'warning' ? 'text-warning-600' : ''}`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            ) : (
              ''
            )}
          </div>
        </td>
      )
    default:
      return (
        <td>
          <p className="text-gray-900 whitespace-no-wrap">--</p>
        </td>
      )
  }
}

export default DynamicCell

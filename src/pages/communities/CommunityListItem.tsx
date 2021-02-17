import React, { useState } from 'react'
import Avatar from '../../components/Avatar'
import useOuterClick from '../../customHooks/useOuterClick'
import { Link } from 'react-router-dom'

type Props = {
  community: any
  openUpdateCommunity: () => void
  onDeleteCommunity: () => void
  onArchiveCommunity: () => void
  onUnarchiveCommunity: () => void
  hideDelete?: boolean
  disableDelete?: boolean
  isArchived?: boolean
}

const CommunityListItem = ({
  community,
  openUpdateCommunity,
  onDeleteCommunity,
  onArchiveCommunity,
  onUnarchiveCommunity,
  hideDelete,
  disableDelete = false,
  isArchived = false,
}: Props) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const optionsRef = useOuterClick(() => setIsOptionsOpen(false))

  const OptionsComponent = isArchived ? (
    <div className="absolute top-0 right-full shadow w-36 bg-white">
      <button
        onClick={() => {
          onUnarchiveCommunity()
          setIsOptionsOpen(false)
        }}
        className="block w-full p-2 hover:bg-gray-100"
      >
        Unarchive
      </button>
    </div>
  ) : (
    <div className="absolute bottom-0 right-full shadow w-36 bg-white">
      <button
        onClick={() => {
          openUpdateCommunity()
          setIsOptionsOpen(false)
        }}
        className="block w-full p-2 hover:bg-gray-100"
      >
        Quick Edit
      </button>
      <Link
        to={`/communities/${community.id}`}
        className="block w-full p-2 hover:bg-gray-100 text-center"
      >
        Edit
      </Link>
      {!hideDelete && (
        <>
          <button
            className={`block w-full p-2 hover:bg-gray-100 text-warning-600 ${
              disableDelete ? 'opacity-30 pointer-events-none' : ''
            }`}
            onClick={
              disableDelete
                ? undefined
                : () => {
                    onArchiveCommunity()
                    setIsOptionsOpen(false)
                  }
            }
            disabled={disableDelete}
          >
            Archive
          </button>
          <button
            className={`block w-full p-2 hover:bg-gray-100 text-red-600 ${
              disableDelete ? 'opacity-30 pointer-events-none' : ''
            }`}
            onClick={
              disableDelete
                ? undefined
                : () => {
                    onDeleteCommunity()
                    setIsOptionsOpen(false)
                  }
            }
            disabled={disableDelete}
          >
            Delete
          </button>
        </>
      )}
    </div>
  )

  return (
    <tr>
      <td>
        <div className="flex items-center">
          <Avatar url={community.profile_photo} name={community.name} size={10} />
          <div className="ml-3">
            <p className="text-gray-900 whitespace-no-wrap">{community.name}</p>
          </div>
        </div>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{community.address.subdivision}</p>
        <p className="text-gray-600 whitespace-no-wrap">{''}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{community.address.city}</p>
        <p className="text-gray-600 whitespace-no-wrap">{''}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{community.address.barangay}</p>
        <p className="text-gray-600 whitespace-no-wrap">{''}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{community.address.state}</p>
        <p className="text-gray-600 whitespace-no-wrap">{''}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{community.address.country}</p>
        <p className="text-gray-600 whitespace-no-wrap">{''}</p>
      </td>

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
          {isOptionsOpen && OptionsComponent}
        </div>
      </td>
    </tr>
  )
}

export default CommunityListItem

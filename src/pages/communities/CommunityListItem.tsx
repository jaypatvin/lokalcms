import React, { useState } from 'react'
import dayjs from 'dayjs'
import Avatar from '../../components/Avatar'
import useOuterClick from '../../customHooks/useOuterClick'
import { Link } from 'react-router-dom'
import { ListItemProps } from '../../utils/types'

const CommunityListItem = ({
  data,
  openUpdate,
  onDelete,
  onArchive,
  onUnarchive,
  hideDelete,
  disableDelete = false,
  isArchived = false,
}: ListItemProps) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const optionsRef = useOuterClick(() => setIsOptionsOpen(false))

  let created_at = '-'
  let created_at_ago = '-'
  if (data.created_at) {
    created_at = dayjs(data.created_at.toDate()).format()
    created_at_ago = dayjs(created_at).fromNow()
  }

  let updated_at = '-'
  let updated_at_ago = '-'
  if (data.updated_at) {
    updated_at = dayjs(data.updated_at.toDate()).format()
    updated_at_ago = dayjs(updated_at).fromNow()
  }

  const OptionsComponent = isArchived ? (
    <div className="absolute top-0 right-full shadow w-36 bg-white">
      <button
        onClick={() => {
          onUnarchive()
          setIsOptionsOpen(false)
        }}
        className="block w-full p-2 hover:bg-gray-100"
      >
        Unarchive
      </button>
      {!hideDelete && (
        <button
          className={`block w-full p-2 hover:bg-gray-100 text-red-600 ${
            disableDelete ? 'opacity-30 pointer-events-none' : ''
          }`}
          onClick={
            disableDelete
              ? undefined
              : () => {
                  if (onDelete) onDelete()
                  setIsOptionsOpen(false)
                }
          }
          disabled={disableDelete}
        >
          Delete
        </button>
      )}
    </div>
  ) : (
    <div className="absolute bottom-0 right-full shadow w-36 bg-white">
      <button
        onClick={() => {
          openUpdate()
          setIsOptionsOpen(false)
        }}
        className="block w-full p-2 hover:bg-gray-100"
      >
        Quick Edit
      </button>
      <Link
        to={`/communities/${data.id}/edit`}
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
                    onArchive()
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
                    if (onDelete) onDelete()
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
          <Link to={`/communities/${data.id}`}>
            <Avatar url={data.profile_photo} name={data.name} size={10} />
          </Link>
          <Link to={`/communities/${data.id}`}>
            <p className="text-primary-600 hover:text-primary-400 ml-2">{data.name}</p>
          </Link>
        </div>
      </td>
      <td>
        <p className="text-gray-900">{`${data.address.subdivision}, ${data.address.barangay}, ${data.address.city}, ${data.address.state}, ${data.address.country}, ${data.address.zip_code}`}</p>
      </td>
      <td>
        {data.admins.length === 0
          ? '--'
          : data.admins.map((admin: any) => <p className="text-gray-900" key={admin.id}>{admin.email}</p>)}
      </td>
      <td>
        <p className="text-gray-900">{data._meta.users_count || '--'}</p>
      </td>
      <td>
        <p className="text-gray-900">{data._meta.shops_count || '--'}</p>
      </td>
      <td>
        <p className="text-gray-900">{data._meta.products_count || '--'}</p>
      </td>
      <td title={created_at}>
        <p className="text-gray-900 whitespace-no-wrap">{created_at_ago}</p>
      </td>
      <td title={updated_at}>
        <p className="text-gray-900 whitespace-no-wrap">{updated_at_ago}</p>
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

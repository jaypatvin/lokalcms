import React, { useState } from 'react'
import dayjs from 'dayjs'
import { isObjectLike } from 'lodash'
import { ListItemProps } from '../../utils/types'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'

const HistoryListItem = ({ data }: ListItemProps) => {
  const [expanded, setExpanded] = useState(false)
  let created_at = '-'
  let created_at_ago = '-'
  if (data.created_at) {
    created_at = dayjs(data.created_at.toDate()).format()
    created_at_ago = dayjs(created_at).fromNow()
  }

  if (data.before) {
    delete data.before.keywords
    delete data.before.created_at
    delete data.before.updated_at
    delete data.before.archived_at
    delete data.before.updated_content_at
  }
  if (data.after) {
    delete data.after.keywords
    delete data.after.created_at
    delete data.after.updated_at
    delete data.after.archived_at
    delete data.after.updated_content_at
  }

  const ArrowIcon = expanded ? IoIosArrowUp : IoIosArrowDown

  const getObjectDiffWithStyle = (
    main: any,
    other: any = {},
    color: 'green' | 'red',
    indent = 0
  ) => {
    let diffString = ''
    Object.entries(main).forEach(([key, val]: any) => {
      if (['string', 'number', 'boolean'].includes(typeof val)) {
        if (!other.hasOwnProperty(key) || other[key] !== val) {
          diffString += `<p class="text-${color}-500 pl-${indent}">${key}: ${val}</p>`
        } else {
          diffString += `<p class="pl-${indent}">${key}: ${val}</p>`
        }
      } else if (isObjectLike(val) && !val.firestore) {
        // prevent going very deep into firestore object
        diffString += `<p class="pl-${indent}">${key}:</p>`
        diffString += getObjectDiffWithStyle(val, other[key], color, indent + 4)
      }
    })
    return diffString
  }

  const beforeRenderString = data.before
    ? getObjectDiffWithStyle(data.before, data.after, 'red')
    : ''
  const afterRenderString = data.after
    ? getObjectDiffWithStyle(data.after, data.before, 'green')
    : ''

  return (
    <>
      <tr>
        <td>
          <p className="text-gray-900 whitespace-no-wrap">{data.actor_email || '--'}</p>
        </td>
        <td>
          <p className="text-gray-900 whitespace-no-wrap">{data.source || '--'}</p>
        </td>
        <td>
          <p className="text-gray-900 whitespace-no-wrap">{data.method}</p>
        </td>
        <td>
          <p className="text-gray-900 whitespace-no-wrap">{data.community_name}</p>
        </td>
        <td>
          <p className="text-gray-900 whitespace-no-wrap">{data.collection_name}</p>
        </td>
        <td>
          <p className="text-gray-900 whitespace-no-wrap">{data.document_id}</p>
        </td>
        <td title={created_at}>
          <p className="text-gray-900 whitespace-no-wrap">{created_at_ago}</p>
        </td>
        <td>
          <p className="text-gray-900 whitespace-no-wrap">
            <button onClick={() => setExpanded(!expanded)}>
              <span className="block h-8 leading-8 ml-1">
                <ArrowIcon className="h-8" size={16} />
              </span>
            </button>
          </p>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={8}>
            <div className="flex w-full bg-secondary-50 p-2 shadow">
              <div className="w-1/2 flex-grow-0 flex-wrap">
                Before:
                <br />
                {data.before ? (
                  <div dangerouslySetInnerHTML={{ __html: beforeRenderString }} />
                ) : (
                  ''
                )}
              </div>
              <div className="w-1/2 flex-grow-0 flex-wrap">
                After:
                <br />
                {data.after ? <div dangerouslySetInnerHTML={{ __html: afterRenderString }} /> : ''}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default HistoryListItem

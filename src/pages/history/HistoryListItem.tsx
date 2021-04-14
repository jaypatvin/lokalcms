import React, { useState } from 'react'
import JSONPretty from 'react-json-pretty'
import dayjs from 'dayjs'
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
            <div className="flex w-full">
              <div className="w-1/2 flex-grow-0 flex-wrap">
                Before:
                <br />
                {data.before ? <JSONPretty id="json-pretty" data={data.before}></JSONPretty> : ''}
              </div>
              <div className="w-1/2 flex-grow-0 flex-wrap">
                After:
                <br />
                {data.after ? <JSONPretty id="json-pretty" data={data.after}></JSONPretty> : ''}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default HistoryListItem
import dayjs from 'dayjs'
import React from 'react'
import SortButton from '../../components/buttons/SortButton'

type Props = {
  data: any
}

const CommunityApplicationLogsTable = ({ data }: Props) => {
  return (
    <div className="table-wrapper w-full">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th key="action_type">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Action"
                  showSortIcons={false}
                />
              </th>
              <th key="user_id">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="User"
                  showSortIcons={false}
                />
              </th>
              <th key="device_id">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Device ID"
                  showSortIcons={false}
                />
              </th>
              <th key="created_at">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Date"
                  showSortIcons={false}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d: any) => {
              const created_at = d.created_at ? dayjs(d.created_at.toDate()).fromNow() : '-'
              return (
                <tr>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.user_email}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.action_type}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.device_id}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{created_at}</p>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CommunityApplicationLogsTable

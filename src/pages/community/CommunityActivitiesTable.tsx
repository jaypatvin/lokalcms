import dayjs from 'dayjs'
import React from 'react'
import SortButton from '../../components/buttons/SortButton'

type Props = {
  data: any
}

const CommunityActivitiesTable = ({ data }: Props) => {
  return (
    <div className="table-wrapper w-full">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th key="user_id">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="User"
                  showSortIcons={false}
                />
              </th>
              <th key="message">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Message"
                  showSortIcons={false}
                />
              </th>
              <th key="status">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Status"
                  showSortIcons={false}
                />
              </th>
              <th key="created_at">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Created At"
                  showSortIcons={false}
                />
              </th>
              <th key="updated_at">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Updated At"
                  showSortIcons={false}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d: any) => {
              const created_at = d.created_at ? dayjs(d.created_at.toDate()).fromNow() : '-'
              const updated_at = d.updated_at ? dayjs(d.updated_at.toDate()).fromNow() : '-'
              return (
                <tr>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.user_email}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.message}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.status}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{created_at}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{updated_at}</p>
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

export default CommunityActivitiesTable

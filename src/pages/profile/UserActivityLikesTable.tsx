import dayjs from 'dayjs'
import React from 'react'
import SortButton from '../../components/buttons/SortButton'
import { ActivityLikeData } from './ProfilePage'

type Props = {
  data: ActivityLikeData[]
}

const UserActivityLikesTable = ({ data }: Props) => {
  return (
    <div className="table-wrapper w-full">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th key="owner">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Owner"
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
                  label="Liked At"
                  showSortIcons={false}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => {
              const liked_at = d.liked_at ? dayjs(d.liked_at.toDate()).fromNow() : '-'
              return (
                <tr key={d.id}>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.owner_email}</p>
                  </td>
                  <td className="flex">
                    <img src={d.images?.[0].url} alt={d.message} className="max-w-16 max-h-16" />
                    <p className="text-gray-900 whitespace-no-wrap ml-1">{d.message}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.status}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{liked_at}</p>
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

export default UserActivityLikesTable

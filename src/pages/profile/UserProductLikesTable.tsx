import dayjs from 'dayjs'
import React from 'react'
import SortButton from '../../components/buttons/SortButton'

type Props = {
  data: any
}

const UserProductLikesTable = ({ data }: Props) => {
  return (
    <div className="table-wrapper w-full">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th key="photo">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Photo"
                  showSortIcons={false}
                />
              </th>
              <th key="name">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Name"
                  showSortIcons={false}
                />
              </th>
              <th key="shop">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Shop"
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
              <th key="liked_at">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Liked At"
                  showSortIcons={false}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d: any) => {
              const liked_at = d.liked_at ? dayjs(d.liked_at.toDate()).fromNow() : '-'
              return (
                <tr key={d.id}>
                  <td>
                    <img src={d.gallery[0].url} alt={d.name} className="max-w-16 max-h-16" />
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.name}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.shop_name}</p>
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

export default UserProductLikesTable

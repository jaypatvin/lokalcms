import dayjs from 'dayjs'
import React from 'react'
import SortButton from '../../components/buttons/SortButton'

type Props = {
  data: any
}

const ShopLikesTable = ({ data }: Props) => {
  return (
    <div className="table-wrapper w-full">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th key="user">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="User"
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
              const liked_at = d.created_at ? dayjs(d.created_at.toDate()).fromNow() : '-'
              return (
                <tr>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.user_email}</p>
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

export default ShopLikesTable

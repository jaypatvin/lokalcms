import dayjs from 'dayjs'
import React from 'react'
import SortButton from '../../components/buttons/SortButton'
import { Report } from '../../models'

type Props = {
  data: (Report & { id: string; user_email?: string; })[]
}

const ShopReportsTable = ({ data }: Props) => {
  return (
    <div className="table-wrapper w-full">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th key="user">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Reporter"
                  showSortIcons={false}
                />
              </th>
              <th key="description">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Description"
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
            </tr>
          </thead>
          <tbody>
            {data.map((d) => {
              const created_at = d.created_at ? dayjs(d.created_at.toDate()).fromNow() : '-'
              return (
                <tr key={d.id}>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.user_email}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.description}</p>
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

export default ShopReportsTable

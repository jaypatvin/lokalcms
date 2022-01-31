import dayjs from 'dayjs'
import React from 'react'
import SortButton from '../../components/buttons/SortButton'
import { ProductData } from './CommunityPage'

type Props = {
  data: ProductData[]
}

const CommunityProductsTable = ({ data }: Props) => {
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
              <th key="price">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Price"
                  showSortIcons={false}
                />
              </th>
              <th key="quantity">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Quantity"
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
                  label="Last Updated"
                  showSortIcons={false}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => {
              const created_at = d.created_at ? dayjs(d.created_at.toDate()).fromNow() : '-'
              const updated_at = d.updated_at ? dayjs(d.updated_at.toDate()).fromNow() : '-'
              return (
                <tr key={d.id}>
                  <td>
                    <img src={d.gallery?.[0].url} alt={d.name} className="max-w-16 max-h-16" />
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.name}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.shop_name}</p>
                    <p className="text-gray-900 whitespace-no-wrap">By: {d.user_email}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.base_price}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.quantity}</p>
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

export default CommunityProductsTable

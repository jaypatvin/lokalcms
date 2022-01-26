import dayjs from 'dayjs'
import React from 'react'
import SortButton from '../../components/buttons/SortButton'
import { ReviewData } from './ProfilePage'

type Props = {
  data: Required<ReviewData>[]
}

const UserReviewsTable = ({ data }: Props) => {
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
              <th key="product">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Product"
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
              <th key="rating">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Rating"
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
            {data.map((d) => {
              const created_at = d.created_at ? dayjs(d.created_at.toDate()).fromNow() : '-'
              const updated_at = d.updated_at ? dayjs(d.updated_at.toDate()).fromNow() : '-'
              const ordered_at = d.order.created_at
                ? dayjs(d.order.created_at.toDate()).fromNow()
                : '-'
              return (
                <tr key={d.id}>
                  <td>
                    <img
                      src={d.product.gallery?.[0].url}
                      alt={d.message}
                      className="max-w-16 max-h-16"
                    />
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.product.name}</p>
                    <p className="text-gray-900 whitespace-no-wrap">Shop: {d.shop.name}</p>
                    <p className="text-gray-900 whitespace-no-wrap">Ordered at: {ordered_at}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.message}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.rating}</p>
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

export default UserReviewsTable

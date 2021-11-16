import React from 'react'
import SortButton from '../../components/buttons/SortButton'
import UserSubscriptionPlansTableItem from './UserSubscriptionPlansTableItem'

type Props = {
  data: any
  userType: 'seller' | 'buyer'
}

const UserSubscriptionPlansTable = ({ data, userType }: Props) => {
  const otherUserType = userType === 'seller' ? 'buyer' : 'seller'
  return (
    <div className="table-wrapper w-full">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th key="product">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Product"
                  showSortIcons={false}
                />
              </th>
              <th key={otherUserType}>
                <SortButton
                  className="text-xs uppercase font-bold"
                  label={otherUserType}
                  showSortIcons={false}
                />
              </th>
              <th key="plan">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Plan"
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
            </tr>
          </thead>
          <tbody>
            {data.map((d: any) => (
              <UserSubscriptionPlansTableItem data={d} userType={userType} key={d.id} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserSubscriptionPlansTable

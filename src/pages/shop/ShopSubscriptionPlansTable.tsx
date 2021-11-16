import React from 'react'
import SortButton from '../../components/buttons/SortButton'
import ShopSubscriptionPlansTableItem from './ShopSubscriptionPlansTableItem'

type Props = {
  data: any
}

const ShopSubscriptionPlansTable = ({ data }: Props) => {
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
              <th key="buyer">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Buyer"
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
              <ShopSubscriptionPlansTableItem data={d} key={d.id} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ShopSubscriptionPlansTable

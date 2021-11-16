import React from 'react'
import SortButton from '../../components/buttons/SortButton'
import CommunityShopsTableItem from './CommunityShopsTableItem'

type Props = {
  data: any
}

const CommunityShopsTable = ({ data }: Props) => {
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
              <th key="description">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Description"
                  showSortIcons={false}
                />
              </th>
              <th key="operatingHours">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Operating Hours"
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
            {data.map((d: any) => (
              <CommunityShopsTableItem data={d} key={d.id} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CommunityShopsTable

import React from 'react'
import SortButton from '../../components/buttons/SortButton'
import UserShopsTableItem from './UserShopsTableItem'

type Props = {
  data: any
}

const UserShopsTable = ({ data }: Props) => {
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
            </tr>
          </thead>
          <tbody>
            {data.map((d: any) => (
              <UserShopsTableItem data={d} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserShopsTable

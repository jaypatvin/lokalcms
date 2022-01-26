import dayjs from 'dayjs'
import React from 'react'
import SortButton from '../../components/buttons/SortButton'
import { InviteData } from './CommunityPage'

type Props = {
  data: InviteData[]
}

const CommunityInvitesTable = ({ data }: Props) => {
  return (
    <div className="table-wrapper w-full">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th key="invitee">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Invitee"
                  showSortIcons={false}
                />
              </th>
              <th key="inviter">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Inviter"
                  showSortIcons={false}
                />
              </th>
              <th key="code">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Code"
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
              <th key="expire_by">
                <SortButton
                  className="text-xs uppercase font-bold"
                  label="Expire by"
                  showSortIcons={false}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => {
              const created_at = d.created_at ? dayjs(d.created_at.toDate()).fromNow() : '-'
              const expire_by = dayjs(d.expire_by).fromNow()
              return (
                <tr key={d.id}>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.invitee_email}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.inviter_email}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.code}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{d.status}</p>
                    <p className="text-gray-900 whitespace-no-wrap">
                      {d.claimed ? 'Claimed' : 'Not claimed'}
                    </p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{created_at}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{expire_by}</p>
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

export default CommunityInvitesTable

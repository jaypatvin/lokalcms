import dayjs from 'dayjs'
import React, { useState } from 'react'
import ReactCalendar from 'react-calendar'
import { OutlineButton } from '../../components/buttons'
import useOuterClick from '../../customHooks/useOuterClick'
import getAvailabilitySummary from '../../utils/dates/getAvailabilitySummary'
import getCalendarTileClassFn from '../../utils/dates/getCalendarTileClassFn'

type Props = {
  data: any
}

const UserShopsTableItem = ({ data }: Props) => {
  const [showCalendar, setShowCalendar] = useState(false)
  const calendarRef = useOuterClick(() => setShowCalendar(false))

  const created_at = data.created_at ? dayjs(data.created_at.toDate()).fromNow() : '-'
  const updated_at = data.updated_at ? dayjs(data.updated_at.toDate()).fromNow() : '-'

  return (
    <tr>
      <td>
        <img src={data.profile_photo} alt={data.name} className="max-w-16 max-h-16" />
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.name}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.description}</p>
      </td>
      <td ref={calendarRef} className="relative">
        <p className="text-gray-900 whitespace-no-wrap flex">
          <OutlineButton
            className="h-8 text-primary-500 mr-1"
            size="small"
            icon="calendar"
            onClick={() => setShowCalendar(!showCalendar)}
          />
          {getAvailabilitySummary(data.operating_hours)}
        </p>
        {showCalendar && (
          <div className="w-64 absolute z-10 shadow">
            <ReactCalendar
              tileClassName={getCalendarTileClassFn(data.operating_hours)}
              onChange={() => null}
              calendarType="US"
            />
          </div>
        )}
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.status}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{created_at}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{updated_at}</p>
      </td>
    </tr>
  )
}

export default UserShopsTableItem

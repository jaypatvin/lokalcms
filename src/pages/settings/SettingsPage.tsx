import dayjs from 'dayjs'
import React from 'react'
import ReactCalendar, { CalendarTileProperties } from 'react-calendar'

// TEMPORARY
// Using for component testing

const schedule: any = {
  mon: {
    start_date: '2021-04-19',
    offset_days: 14
  },
  wed: {
    start_date: '2021-04-21',
    offset_days: 14
  },
  fri: {
    start_date: '2021-04-23',
    offset_days: 14
  },
  custom: {
    "2021-05-03": {
      unavailable: true
    },
    "2021-05-05": {
      start_time: '12:00 pm',
      end_time: '04:00 pm',
    },
  }
}

const DayKeyVal: any = {
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
  7: 'sun',
}

const SettingsPage = (props: any) => {
  const getTileClass = ({date}: CalendarTileProperties) => {
    const tileDate = dayjs(date)
    const day = DayKeyVal[date.getDay()]
    const schedDay = schedule[day]
    let customDate
    if (schedule.custom) {
      customDate = schedule.custom[tileDate.format('YYYY-MM-DD')]
    }
    if (customDate && customDate.unavailable) {
      return 'text-gray-500'
    } else if (customDate && customDate.start_time && customDate.end_time) {
      return 'text-green-500'
    } else if (schedDay) {
      const startDate = dayjs(schedDay.start_date)
      const offsetDays = tileDate.diff(startDate, 'days')
      if (offsetDays >= 0 && !(offsetDays % schedDay.offset_days)) return 'text-red-500'
    }
    return null
  }
  return (
    <div>
      <h3>Settings</h3>
      <ReactCalendar tileClassName={getTileClass} />
    </div>
  )
}

export default SettingsPage

import React, { useState } from 'react'
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import ReactCalendar, { CalendarTileProperties } from 'react-calendar'
import useOuterClick from '../../customHooks/useOuterClick'
import { DayKeyVal, ListItemProps } from '../../utils/types'
import { OutlineButton } from '../../components/buttons'

dayjs.extend(advancedFormat)

const nthDayOfMonthFormat = /^(1|2|3|4|5)-(mon|tue|wed|thu|fri|sat|sun)$/

const ShopListItem = ({
  data,
  openUpdate,
  onArchive,
  onUnarchive,
  hideDelete,
  isArchived = false,
}: ListItemProps) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const optionsRef = useOuterClick(() => setIsOptionsOpen(false))
  const calendarRef = useOuterClick(() => setShowCalendar(false))

  let created_at = '-'
  let created_at_ago = '-'
  if (data.created_at) {
    created_at = dayjs(data.created_at.toDate()).format()
    created_at_ago = dayjs(created_at).fromNow()
  }

  let updated_at = '-'
  let updated_at_ago = '-'
  if (data.updated_at) {
    updated_at = dayjs(data.updated_at.toDate()).format()
    updated_at_ago = dayjs(updated_at).fromNow()
  }

  let operating_hours = '-'
  if (data.operating_hours) {
    const {
      start_dates,
      repeat_unit,
      repeat_type,
      schedule: { mon, tue, wed, thu, fri, sat, sun },
    } = data.operating_hours
    if (repeat_unit === 0) {
      operating_hours = start_dates[0]
    } else if (repeat_unit > 0) {
      const daysAvailable = []
      if (mon) daysAvailable.push('monday')
      if (tue) daysAvailable.push('tuesday')
      if (wed) daysAvailable.push('wednesday')
      if (thu) daysAvailable.push('thursday')
      if (fri) daysAvailable.push('friday')
      if (sat) daysAvailable.push('saturday')
      if (sun) daysAvailable.push('sunday')
      if (repeat_unit === 1) {
        if (repeat_type === 'day') operating_hours = 'Every day'
        if (repeat_type === 'week') operating_hours = `Every week on ${daysAvailable}`
        if (repeat_type === 'month')
          operating_hours = `Every ${dayjs(start_dates[0]).format('Do')} of the month`
        if (nthDayOfMonthFormat.test(repeat_type)) {
          const [nth] = repeat_type.split('-')
          operating_hours = `Every ${dayjs(`2021-01-${nth}`).format('Do')} ${dayjs(
            start_dates[0]
          ).format('dddd')}`
        }
      } else if (repeat_unit > 1) {
        if (repeat_type === 'day') operating_hours = `Every ${repeat_unit} days`
        if (repeat_type === 'week')
          operating_hours = `Every ${repeat_unit} weeks on ${daysAvailable}`
        if (repeat_type === 'month')
          operating_hours = `Every ${dayjs(start_dates[0]).format(
            'Do'
          )} of every ${repeat_unit} months`
        if (nthDayOfMonthFormat.test(repeat_type)) {
          const [nth] = repeat_type.split('-')
          operating_hours = `Every ${dayjs(`2021-01-${nth}`).format('Do')} ${dayjs(
            start_dates[0]
          ).format('dddd')} of every ${repeat_unit} months`
        }
      }
    }
  }

  const getTileClass = ({ date }: CalendarTileProperties) => {
    const { start_dates, repeat_unit, repeat_type, schedule } = data.operating_hours
    const firstDate = start_dates[0]
    const firstDateDay = DayKeyVal[dayjs(firstDate).day()]
    const firstDateNumToCheck = dayjs(firstDate).date()
    const firstDateNthWeek = Math.ceil(firstDateNumToCheck / 7)
    const firstDateNthDayOfMonth = `${firstDateNthWeek}-${firstDateDay}`
    const tileDate = dayjs(date)
    const tileDateDay = DayKeyVal[tileDate.day()]
    const tileDateNumToCheck = tileDate.date()
    const tileDateNthWeek = Math.ceil(tileDateNumToCheck / 7)
    const tileDateNthDayOfMonth = `${tileDateNthWeek}-${tileDateDay}`
    const day = DayKeyVal[tileDate.day()]
    const schedDay = schedule[day]
    let customDate
    let tileClass = null
    if (schedule.custom) {
      customDate = schedule.custom[tileDate.format('YYYY-MM-DD')]
    }
    if (customDate && customDate.unavailable) {
      tileClass = 'gray'
    } else if (customDate && customDate.start_time && customDate.end_time) {
      tileClass = 'yellow'
    } else {
      if (repeat_type === 'day') {
        const isValid = dayjs(date).diff(firstDate, 'days') % repeat_unit === 0
        if (isValid && (dayjs(firstDate).isBefore(date) || dayjs(firstDate).isSame(date))) {
          tileClass = 'orange'
        }
      }
      if (repeat_type === 'week' && schedDay) {
        const isValid = dayjs(date).diff(schedDay.start_date, 'weeks') % repeat_unit === 0
        if (
          isValid &&
          (dayjs(schedDay.start_date).isBefore(date) || dayjs(schedDay.start_date).isSame(date))
        ) {
          tileClass = 'orange'
        }
      }
      if (repeat_type === 'month') {
        const isValid =
          dayjs(firstDate).date() === dayjs(date).date() &&
          dayjs(date).diff(firstDate, 'months') % repeat_unit === 0
        if (isValid && (dayjs(firstDate).isBefore(date) || dayjs(firstDate).isSame(date))) {
          tileClass = 'orange'
        }
      }
      if (nthDayOfMonthFormat.test(repeat_type)) {
        const isValid = firstDateNthDayOfMonth === tileDateNthDayOfMonth  && dayjs(date).diff(firstDate, 'months') % repeat_unit === 0
        if (isValid && (dayjs(firstDate).isBefore(date) || dayjs(firstDate).isSame(date))) {
          tileClass = 'orange'
        }
      }
    }
    return tileClass
  }

  const OptionsComponent = isArchived ? (
    <div className="absolute top-0 right-full shadow w-36 bg-white">
      <button
        onClick={() => {
          onUnarchive()
          setIsOptionsOpen(false)
        }}
        className="block w-full p-2 hover:bg-gray-100"
      >
        Unarchive
      </button>
    </div>
  ) : (
    <div className="absolute top-0 right-full shadow w-36 bg-white">
      <button
        onClick={() => {
          openUpdate()
          setIsOptionsOpen(false)
        }}
        className="block w-full p-2 hover:bg-gray-100"
      >
        Edit
      </button>
      {!hideDelete && (
        <button
          className="block w-full p-2 hover:bg-gray-100 text-red-600"
          onClick={() => {
            if (onArchive) onArchive()
            setIsOptionsOpen(false)
          }}
        >
          Delete
        </button>
      )}
    </div>
  )

  return (
    <tr>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.name}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.description}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.user_email || data.user_id}</p>
      </td>
      <td ref={calendarRef} className="relative">
        <p className="text-gray-900 whitespace-no-wrap flex">
          <OutlineButton
            className="h-8 text-primary-500 mr-1"
            size="small"
            icon="calendar"
            onClick={() => setShowCalendar(!showCalendar)}
          />
          {operating_hours}
        </p>
        {showCalendar && (
          <div className="w-64 absolute z-10 shadow">
            <ReactCalendar tileClassName={getTileClass} onChange={() => null} calendarType="US" />
          </div>
        )}
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.is_close ? 'true' : 'false'}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.status}</p>
      </td>
      <td title={created_at}>
        <p className="text-gray-900 whitespace-no-wrap">{created_at_ago}</p>
      </td>
      <td title={updated_at}>
        <p className="text-gray-900 whitespace-no-wrap">{updated_at_ago}</p>
      </td>

      <td className="action-col">
        <div ref={optionsRef} className="relative">
          <button
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            type="button"
            className="inline-block text-gray-500 hover:text-gray-700"
          >
            <svg className="inline-block h-6 w-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm-2 6a2 2 0 104 0 2 2 0 00-4 0z" />
            </svg>
          </button>
          {isOptionsOpen && OptionsComponent}
        </div>
      </td>
    </tr>
  )
}

export default ShopListItem

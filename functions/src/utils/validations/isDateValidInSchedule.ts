import dayjs from 'dayjs'
import { get } from 'lodash'
import { DayKeyVal } from '../helpers'

const isDateValidInSchedule = ({ repeat_unit, repeat_type, schedule, startDate, dateToCheck }) => {
  const currentDate = dayjs(new Date()).format('YYYY-MM-DD')
  const dateToCheckFormat = dateToCheck.format('YYYY-MM-DD')
  const dateToCheckDay = DayKeyVal[dateToCheck.day()]
  const dateNumToCheck = dayjs(dateToCheck).date()
  const nthWeekToCheck = Math.ceil(dateNumToCheck / 7)
  const nthDayOfMonthToCheck = `${nthWeekToCheck}-${dateToCheckDay}`
  const weekAvailabilityStartDate = get(schedule, `${dateToCheckDay}.start_date`)
  return (
    (!get(schedule, `custom.${dateToCheckFormat}.unavailable`) ||
      (repeat_unit === 0 && dayjs(startDate).isBefore(currentDate))) &&
    (get(schedule, `custom.${dateToCheckFormat}.start_time`) ||
      (repeat_unit === 1 && repeat_type === 'day') ||
      (repeat_unit === 1 &&
        repeat_type === 'week' &&
        weekAvailabilityStartDate &&
        (dayjs(weekAvailabilityStartDate).isBefore(dateToCheck) ||
          dayjs(weekAvailabilityStartDate).isSame(dateToCheck))) ||
      (repeat_unit === 1 &&
        repeat_type === 'month' &&
        dayjs(startDate).date() === dayjs(dateToCheck).date() &&
        (dayjs(startDate).isBefore(dateToCheck) || dayjs(startDate).isSame(dateToCheck))) ||
      (repeat_unit === 1 &&
        repeat_type === nthDayOfMonthToCheck &&
        (dayjs(startDate).isBefore(dateToCheck) || dayjs(startDate).isSame(dateToCheck))) ||
      (repeat_unit !== 1 &&
        repeat_type === 'day' &&
        dayjs(dateToCheck).diff(startDate, 'days') % repeat_unit === 0 &&
        (dayjs(startDate).isBefore(dateToCheck) || dayjs(startDate).isSame(dateToCheck))) ||
      (repeat_unit !== 1 &&
        repeat_type === 'week' &&
        weekAvailabilityStartDate &&
        dayjs(dateToCheck).diff(weekAvailabilityStartDate, 'weeks') % repeat_unit === 0 &&
        (dayjs(weekAvailabilityStartDate).isBefore(dateToCheck) ||
          dayjs(weekAvailabilityStartDate).isSame(dateToCheck))) ||
      (repeat_unit !== 1 &&
        repeat_type === 'month' &&
        dayjs(startDate).date() === dayjs(dateToCheck).date() &&
        dayjs(dateToCheck).diff(startDate, 'months') % repeat_unit === 0 &&
        (dayjs(startDate).isBefore(dateToCheck) || dayjs(startDate).isSame(dateToCheck))) ||
      (repeat_unit !== 1 &&
        repeat_type === nthDayOfMonthToCheck &&
        dayjs(dateToCheck).diff(startDate, 'months') % repeat_unit === 0 &&
        (dayjs(startDate).isBefore(dateToCheck) || dayjs(startDate).isSame(dateToCheck))))
  )
}

export default isDateValidInSchedule

import dayjs from 'dayjs'
import { get } from 'lodash'
import { DayKeyVal } from './helpers'

const generateDatesFromSchedule = ({ start_dates, repeat_unit, repeat_type, schedule }) => {
  const maxRangeDays = 45
  const currentDate = dayjs(new Date()).format('YYYY-MM-DD')
  const validDates = []
  const firstStartDate = start_dates[0]
  for (let i = 1; i < maxRangeDays; i++) {
    const dateToCheck = dayjs(currentDate).add(i, 'days')
    const dateToCheckFormat = dateToCheck.format('YYYY-MM-DD')
    const dateToCheckDay = DayKeyVal[dateToCheck.day()]
    const dateNumToCheck = dayjs(dateToCheck).date()
    const nthWeekToCheck = Math.ceil(dateNumToCheck / 7)
    const nthDayOfMonthToCheck = `${nthWeekToCheck}-${dateToCheckDay}`
    if (
      !get(schedule, `custom.${dateToCheckFormat}.unavailable`) ||
      (repeat_unit === 0 && dayjs(firstStartDate).isBefore(currentDate))
    ) {
      const weekAvailabilityStartDate = get(schedule, `${dateToCheckDay}.start_date`)
      if (
        get(schedule, `custom.${dateToCheckFormat}.start_time`) ||
        (repeat_unit === 1 && repeat_type === 'day') ||
        (repeat_unit === 1 &&
          repeat_type === 'week' &&
          weekAvailabilityStartDate &&
          (dayjs(weekAvailabilityStartDate).isBefore(dateToCheck) ||
            dayjs(weekAvailabilityStartDate).isSame(dateToCheck))) ||
        (repeat_unit === 1 &&
          repeat_type === 'month' &&
          dayjs(firstStartDate).date() === dayjs(dateToCheck).date() &&
          (dayjs(firstStartDate).isBefore(dateToCheck) ||
            dayjs(firstStartDate).isSame(dateToCheck))) ||
        (repeat_unit === 1 &&
          repeat_type === nthDayOfMonthToCheck &&
          (dayjs(firstStartDate).isBefore(dateToCheck) ||
            dayjs(firstStartDate).isSame(dateToCheck))) ||
        (repeat_unit !== 1 &&
          repeat_type === 'day' &&
          dayjs(dateToCheck).diff(firstStartDate, 'days') % repeat_unit === 0 &&
          (dayjs(firstStartDate).isBefore(dateToCheck) ||
            dayjs(firstStartDate).isSame(dateToCheck))) ||
        (repeat_unit !== 1 &&
          repeat_type === 'week' &&
          weekAvailabilityStartDate &&
          dayjs(dateToCheck).diff(weekAvailabilityStartDate, 'weeks') % repeat_unit === 0 &&
          (dayjs(weekAvailabilityStartDate).isBefore(dateToCheck) ||
            dayjs(weekAvailabilityStartDate).isSame(dateToCheck))) ||
        (repeat_unit !== 1 &&
          repeat_type === 'month' &&
          dayjs(firstStartDate).date() === dayjs(dateToCheck).date() &&
          dayjs(dateToCheck).diff(firstStartDate, 'months') % repeat_unit === 0 &&
          (dayjs(firstStartDate).isBefore(dateToCheck) ||
            dayjs(firstStartDate).isSame(dateToCheck))) ||
        (repeat_unit !== 1 &&
          repeat_type === nthDayOfMonthToCheck &&
          dayjs(dateToCheck).diff(firstStartDate, 'months') % repeat_unit === 0 &&
          (dayjs(firstStartDate).isBefore(dateToCheck) ||
            dayjs(firstStartDate).isSame(dateToCheck)))
      ) {
        validDates.push(dateToCheckFormat)
      }
    }
  }

  return validDates
}

export default generateDatesFromSchedule

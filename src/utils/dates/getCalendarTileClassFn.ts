import dayjs from 'dayjs'
import { CalendarTileProperties } from 'react-calendar'
import { DayKeyVal, nthDayOfMonthFormat } from '../types'

const getCalendarTileClassFn =
  ({ start_dates, repeat_unit, repeat_type, schedule }: any) =>
  ({ date }: CalendarTileProperties) => {
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
        const firstDateMonth = dayjs(firstDate).month() + 1
        const tileDateMonth = dayjs(date).month() + 1

        const isValid =
          firstDateNthDayOfMonth === tileDateNthDayOfMonth &&
          (firstDateMonth - tileDateMonth) % repeat_unit === 0
        if (isValid && (dayjs(firstDate).isBefore(date) || dayjs(firstDate).isSame(date))) {
          tileClass = 'orange'
        }
      }
    }
    return tileClass
  }

export default getCalendarTileClassFn

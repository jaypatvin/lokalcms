import dayjs from 'dayjs'
import { Shop } from '../../models'
import { DayKeyVal } from '../types'
import { validateNthDayOfMonth } from './validateNthDayOfMonth'

export const isAvailableByDefault = (date: Date, shop: Shop) => {
  const { start_dates, repeat_unit, repeat_type, schedule } = shop.operating_hours
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

  if (schedule.custom) {
    customDate = schedule.custom[tileDate.format('YYYY-MM-DD')]
  }
  if (customDate && customDate.unavailable) {
    return false
  } else if (customDate && customDate.start_time && customDate.end_time) {
    return true
  } else {
    if (repeat_type === 'day') {
      const isValid = dayjs(date).diff(firstDate, 'days') % repeat_unit === 0
      if (isValid && (dayjs(firstDate).isBefore(date) || dayjs(firstDate).isSame(date))) {
        return true
      }
    }
    if (repeat_type === 'week' && schedDay) {
      const isValid = dayjs(date).diff(schedDay.start_date, 'weeks') % repeat_unit === 0
      if (
        isValid &&
        (dayjs(schedDay.start_date).isBefore(date) || dayjs(schedDay.start_date).isSame(date))
      ) {
        return true
      }
    }
    if (repeat_type === 'month') {
      const isValid =
        dayjs(firstDate).date() === dayjs(date).date() &&
        dayjs(date).diff(firstDate, 'months') % repeat_unit === 0
      if (isValid && (dayjs(firstDate).isBefore(date) || dayjs(firstDate).isSame(date))) {
        return true
      }
    }
    if (validateNthDayOfMonth(repeat_type)) {
      const isValid =
        firstDateNthDayOfMonth === tileDateNthDayOfMonth &&
        dayjs(date).diff(firstDate, 'months') % repeat_unit === 0
      if (isValid && (dayjs(firstDate).isBefore(date) || dayjs(firstDate).isSame(date))) {
        return true
      }
    }
  }
  return false
}

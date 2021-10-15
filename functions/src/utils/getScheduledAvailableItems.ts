import dayjs from 'dayjs'
import { chain, get, includes, map } from 'lodash'
import { DayKeyVal } from './helpers'
import isDateValidInSchedule from './isDateValidInSchedule'

const getScheduledAvailableItems = (
  items: any[],
  scheduleFieldName: 'availability' | 'operating_hours',
  options: any = {}
) => {
  const { date = dayjs(new Date()).format('YYYY-MM-DD'), maxRangeDays = 30 } = options
  const day = DayKeyVal[dayjs(date).day()]
  const dateNum = dayjs(date).date()
  const nthWeek = Math.ceil(dateNum / 7)
  const nthDayOfMonth = `${nthWeek}-${day}`

  const itemsMap = items.reduce((acc, item) => {
    const repeat_unit = item[scheduleFieldName].repeat_unit === 1 ? '1' : 'n'
    const repeat_type = item[scheduleFieldName].repeat_type

    if (!acc[`${repeat_unit}_${repeat_type}`]) acc[`${repeat_unit}_${repeat_type}`] = []
    acc[`${repeat_unit}_${repeat_type}`].push(item)

    if (get(item[scheduleFieldName], `schedule.custom.${date}.start_time`)) {
      if (!acc.customAvailable) acc.customAvailable = []
      acc.customAvailable.push(item)
    }

    if (get(item[scheduleFieldName], `schedule.custom.${date}.unavailable`)) {
      if (!acc.customUnavailable) acc.customUnavailable = []
      acc.customUnavailable.push(item)
    }
    return acc
  }, {})

  // get available items that are available every day
  const everyDay = get(itemsMap, '1_day', []).filter((item) => {
    const start_date = item[scheduleFieldName].start_dates[0]
    return dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date)
  })
  // get available items that are available every n day
  const everyNDay = get(itemsMap, 'n_day', []).filter((item) => {
    const start_date = item[scheduleFieldName].start_dates[0]
    const isValid =
      dayjs(date).diff(start_date, 'days') % get(item, `${scheduleFieldName}.repeat_unit`) === 0
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })
  // get available items that are available every week
  const everyWeek = get(itemsMap, '1_week', []).filter((item) => {
    const start_date = get(item, `${scheduleFieldName}.schedule.${day}.start_date`)
    return start_date && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })
  // get available items that are available every n week
  const everyNWeek = get(itemsMap, 'n_week', []).filter((item) => {
    const start_date = get(item, `${scheduleFieldName}.schedule.${day}.start_date`)
    const isValid =
      dayjs(date).diff(start_date, 'weeks') % get(item, `${scheduleFieldName}.repeat_unit`) === 0
    return (
      start_date && isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
    )
  })
  // get available items that are available every month
  const everyMonth = get(itemsMap, '1_month', []).filter((item) => {
    const start_date = item[scheduleFieldName].start_dates[0]
    const isValid = dayjs(start_date).date() === dateNum
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })
  // get available items that are available every n month
  const everyNMonth = get(itemsMap, 'n_month', []).filter((item) => {
    const start_date = item[scheduleFieldName].start_dates[0]
    const isValid =
      dayjs(start_date).date() === dateNum &&
      dayjs(date).diff(start_date, 'months') % get(item, `${scheduleFieldName}.repeat_unit`) === 0
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })
  // get available items that are available every nth day of the month
  const everyNthDayOfMonth = get(itemsMap, `1_${nthDayOfMonth}`, []).filter((item) => {
    const start_date = item[scheduleFieldName].start_dates[0]
    return dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date)
  })
  // get available items that are available every nth day of every n month
  const everyNthDayOfNMonth = get(itemsMap, `1_${nthDayOfMonth}`, []).filter((item) => {
    const start_date = item[scheduleFieldName].start_dates[0]
    const isValid =
      dayjs(date).diff(start_date, 'months') % get(item, `${scheduleFieldName}.repeat_unit`) === 0
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })

  const customAvailable = itemsMap.customAvailable || []

  const unavailable = itemsMap.customUnavailable || []
  const unavailableIds = unavailable.map((item) => item.id)

  const allAvailable = [
    ...everyDay,
    ...everyNDay,
    ...everyWeek,
    ...everyNWeek,
    ...everyMonth,
    ...everyNMonth,
    ...everyNthDayOfMonth,
    ...everyNthDayOfNMonth,
    ...customAvailable,
  ]
  const result = chain(allAvailable)
    .filter((item) => !includes(unavailableIds, item.id))
    .uniqBy((item) => item.id)
    .value()

  const availableIds = map(result, (item) => item.id)

  result.forEach((item) => {
    delete item.keywords
    delete item[scheduleFieldName]
  })

  const unavailable_items = items.filter((p) => !availableIds.includes(p.id))

  unavailable_items.forEach((item) => {
    const availability = item[scheduleFieldName]
    const schedule = availability.schedule
    const repeat_unit = availability.repeat_unit
    const repeat_type = availability.repeat_type
    const firstStartDate = availability.start_dates[0]
    let availabilityFound
    let i = 1
    while (!availabilityFound && i <= maxRangeDays) {
      const dateToCheck = dayjs(date).add(i, 'days')
      const dateToCheckFormat = dateToCheck.format('YYYY-MM-DD')
      const isDateValid = isDateValidInSchedule({
        repeat_type,
        repeat_unit,
        schedule,
        startDate: firstStartDate,
        dateToCheck,
      })
      if (isDateValid) {
        availabilityFound = dateToCheckFormat
      }
      i++
    }
    if (availabilityFound) {
      item.nextAvailable = availabilityFound
      item.nextAvailableDay = DayKeyVal[dayjs(availabilityFound).day()]
      if (dayjs(availabilityFound).diff(dayjs(date), 'days') === 1) {
        item.availableMessage = `Available tomorrow`
      } else {
        item.availableMessage = `Available on ${availabilityFound}`
      }
    } else if (repeat_unit === 0 && dayjs(firstStartDate).isBefore(date)) {
      item.nextAvailable = 'none'
      item.availableMessage = `Not available anymore`
    } else {
      item.nextAvailable = `more than ${maxRangeDays} days`
      item.availableMessage = `Available in ${maxRangeDays}+ days`
    }

    delete item.keywords
    delete item[scheduleFieldName]
  })

  unavailable_items.sort((a, b) => {
    return a.nextAvailable < b.nextAvailable ? -1 : 1
  })

  return [...result, ...unavailable_items]
}

export default getScheduledAvailableItems

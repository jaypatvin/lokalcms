import dayjs from 'dayjs'
import { nthDayOfMonthFormat } from '../types'

const getAvailabilitySummary = (data: any) => {
  let summary = '-'
  const {
    start_dates,
    repeat_unit,
    repeat_type,
    schedule: { mon, tue, wed, thu, fri, sat, sun },
  } = data
  if (repeat_unit === 0) {
    summary = start_dates[0]
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
      if (repeat_type === 'day') summary = 'Every day'
      if (repeat_type === 'week') summary = `Every week on ${daysAvailable}`
      if (repeat_type === 'month')
        summary = `Every ${dayjs(start_dates[0]).format('Do')} of the month`
      if (nthDayOfMonthFormat.test(repeat_type)) {
        const [nth] = repeat_type.split('-')
        summary = `Every ${dayjs(`2021-01-${nth}`).format('Do')} ${dayjs(start_dates[0]).format(
          'dddd'
        )}`
      }
    } else if (repeat_unit > 1) {
      if (repeat_type === 'day') summary = `Every ${repeat_unit} days`
      if (repeat_type === 'week') summary = `Every ${repeat_unit} weeks on ${daysAvailable}`
      if (repeat_type === 'month')
        summary = `Every ${dayjs(start_dates[0]).format('Do')} of every ${repeat_unit} months`
      if (nthDayOfMonthFormat.test(repeat_type)) {
        const [nth] = repeat_type.split('-')
        summary = `Every ${dayjs(`2021-01-${nth}`).format('Do')} ${dayjs(start_dates[0]).format(
          'dddd'
        )} of every ${repeat_unit} months`
      }
    }
  }

  return summary
}

export default getAvailabilitySummary

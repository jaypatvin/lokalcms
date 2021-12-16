import dayjs from 'dayjs'
import { isDateValidInSchedule } from '../validations'

const generateDatesFromSchedule = (
  { start_dates, repeat_unit, repeat_type, schedule },
  options: any = {}
) => {
  const currentDate = new Date()
  const {
    start_date = dayjs(currentDate).format('YYYY-MM-DD'),
    end_date = dayjs(start_date || currentDate)
      .add(45, 'days')
      .format('YYYY-MM-DD'),
  } = options
  const maxRangeDays = Math.abs(dayjs(start_date).diff(end_date, 'days'))
  const validDates = []
  const firstStartDate = start_dates[0]
  for (let i = 0; i <= maxRangeDays; i++) {
    const dateToCheck = dayjs(start_date).add(i, 'days')
    const dateToCheckFormat = dateToCheck.format('YYYY-MM-DD')
    const isDateValid = isDateValidInSchedule({
      repeat_type,
      repeat_unit,
      schedule,
      startDate: firstStartDate,
      dateToCheck,
    })
    if (isDateValid) {
      validDates.push(dateToCheckFormat)
    }
  }

  return validDates
}

export default generateDatesFromSchedule

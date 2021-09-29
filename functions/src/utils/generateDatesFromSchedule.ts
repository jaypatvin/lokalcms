import dayjs from 'dayjs'
import isDateValidInSchedule from './isDateValidInSchedule'

const generateDatesFromSchedule = ({ start_dates, repeat_unit, repeat_type, schedule }) => {
  const maxRangeDays = 45
  const currentDate = dayjs(new Date()).format('YYYY-MM-DD')
  const validDates = []
  const firstStartDate = start_dates[0]
  for (let i = 1; i < maxRangeDays; i++) {
    const dateToCheck = dayjs(currentDate).add(i, 'days')
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

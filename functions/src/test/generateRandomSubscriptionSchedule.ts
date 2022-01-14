import Chance from 'chance'
import dayjs from 'dayjs'
import { generateSubscriptionPlanSchedule } from '../utils/generators'
import { DayKeyVal } from '../utils/helpers'

const chance = new Chance()

export const generateRandomSubscriptionSchedule = () => {
  const randomDate = dayjs(new Date()).add(chance.integer({ min: -31, max: 31 }), 'day')
  const randomDateString = randomDate.format('YYYY-MM-DD')
  const day = DayKeyVal[dayjs(randomDateString).day()]
  const dateNum = dayjs(randomDateString).date()
  const nthWeek = Math.ceil(dateNum / 7)
  const nthDayOfMonth = `${nthWeek}-${day}`

  const repeatType = chance.pickone(['day', 'week', 'month', nthDayOfMonth])

  let startDates = [randomDateString]

  if (repeatType === 'week') {
    const extraDays = chance.integer({ min: 1, max: 6 })
    const randomDates = [randomDateString]
    for (let i = 1; i <= extraDays; i++) {
      const nextDay = dayjs(randomDate).add(i, 'day').format('YYYY-MM-DD')
      randomDates.push(nextDay)
    }
    startDates = chance.pickset(randomDates, chance.integer({ min: 1, max: 6 }))
  }

  return {
    repeat_type: repeatType,
    repeat_unit: chance.integer({ min: 1, max: 3 }),
    start_dates: startDates,
    schedule: generateSubscriptionPlanSchedule({
      start_dates: startDates,
      // @ts-ignore
      repeat_type: repeatType,
    }),
  }
}

import dayjs from 'dayjs'

type Days = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

const DayKeyVal: { [x: number]: Days } = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
}


type RepeatType =
  | 'day'
  | 'week'
  | 'month'

type DayType = {
  start_date: string
}

type ScheduleType = {
  mon?: DayType
  tue?: DayType
  wed?: DayType
  thu?: DayType
  fri?: DayType
  sat?: DayType
  sun?: DayType
}

type Fields = {
  start_dates: string[]
  repeat_type: RepeatType
}

const generateSubscriptionPlanSchedule = ({
  start_dates,
  repeat_type,
}: Fields) => {
  const schedule: ScheduleType = {}

  start_dates.forEach((date) => {
    if (['day', 'week', 'month'].includes(repeat_type)) {
      const day = DayKeyVal[dayjs(date).day()]
      schedule[day] = {
        start_date: date,
      }
    }
  })

  return schedule
}

export default generateSubscriptionPlanSchedule

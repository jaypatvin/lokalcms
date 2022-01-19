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
  | '1-mon'
  | '1-tue'
  | '1-wed'
  | '1-thu'
  | '1-fri'
  | '1-sat'
  | '1-sun'
  | '1-mon'
  | '2-tue'
  | '2-wed'
  | '2-thu'
  | '2-fri'
  | '2-sat'
  | '2-sun'
  | '3-mon'
  | '3-tue'
  | '3-wed'
  | '3-thu'
  | '3-fri'
  | '3-sat'
  | '3-sun'
  | '4-mon'
  | '4-tue'
  | '4-wed'
  | '4-thu'
  | '4-fri'
  | '4-sat'
  | '4-sun'
  | '5-mon'
  | '5-tue'
  | '5-wed'
  | '5-thu'
  | '5-fri'
  | '5-sat'
  | '5-sun'

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

const generateSubscriptionPlanSchedule = ({ start_dates, repeat_type }: Fields) => {
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

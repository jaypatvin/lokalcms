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
  | 'none'
  | 'every_day'
  | 'every_other_day'
  | 'every_week'
  | 'every_other_week'
  | 'every_month'

type CustomDate = {
  date: string
  start_time?: string
  end_time?: string
}

type DayType = {
  start_date: string
  repeat: RepeatType
}

type ScheduleType = {
  mon?: DayType
  tue?: DayType
  wed?: DayType
  thu?: DayType
  fri?: DayType
  sat?: DayType
  sun?: DayType
  custom?: {
    [x: string]: {
      unavailable?: boolean
      start_time?: string
      end_time?: string
    }
  }
}

type Fields = {
  start_time: string
  end_time: string
  start_dates: string[]
  repeat: RepeatType
  unavailable_dates?: string[]
  custom_dates?: CustomDate[]
}

const generateSchedule = ({
  start_time,
  end_time,
  start_dates,
  repeat,
  unavailable_dates,
  custom_dates,
}: Fields) => {
  const schedule: ScheduleType = {}

  start_dates.forEach((date) => {
    if (repeat === 'none') {
      if (!schedule.custom) schedule.custom = {}
      schedule.custom[date] = {
        start_time,
        end_time,
      }
    } else {
      const day = DayKeyVal[dayjs(date).day()]
      schedule[day] = {
        start_date: date,
        repeat,
      }
    }
  })

  if (unavailable_dates && unavailable_dates.length) {
    unavailable_dates.forEach((date) => {
      if (!schedule.custom) schedule.custom = {}
      schedule.custom[date] = {
        unavailable: true,
      }
    })
  }

  if (custom_dates && custom_dates.length) {
    custom_dates.forEach((custom_date) => {
      const { date, start_time: start, end_time: end } = custom_date
      if (!schedule.custom) schedule.custom = {}
      schedule.custom[date] = {
        start_time: start || start_time,
        end_time: end || end_time,
      }
    })
  }

  return schedule
}

export default generateSchedule